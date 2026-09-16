import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { success, error } from '../utils/response.js';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";

router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' }));

router.post('/oauth', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, provider, providerAccountId } = req.body;
    if (!email) {
      return error(res, 'Email is required', 400);
    }

    const dbRole = await prisma.role.findUnique({ where: { code: 'ENTREPRENEUR' } });

    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'User',
          emailVerified: new Date(),
          roles: dbRole ? { create: { roleId: dbRole.id } } : undefined
        },
        include: { roles: { include: { role: true } } }
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
        include: { roles: { include: { role: true } } }
      });
    }

    const userRoles = user.roles.map(r => r.role.code);
    const token = jwt.sign(
      { userId: user.id, email: user.email, roles: userRoles }, 
      process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod", 
      { expiresIn: '7d' }
    );
    
    return success(res, { 
      user: { id: user.id, email: user.email, name: user.name, roles: userRoles }, 
      token 
    }, 'OAuth sync successful', 200);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  success(res, { message: 'Logged out successfully' }, 'Logout', 200);
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return error(res, 'Unauthorized', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id }, 
      select: { id: true, email: true, name: true, roles: { include: { role: true } }, status: true } 
    });
    if (!user) return error(res, 'User not found', 404);
    
    const userRoles = user.roles.map(r => r.role.code);
    return success(res, { user: { ...user, roles: userRoles } }, 'Profile retrieved', 200);
  } catch (err) {
    next(err);
  }
});

export default router;
