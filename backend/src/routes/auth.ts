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

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, roleCode } = req.body;
    if (!email || !password || !name) {
      return error(res, 'Email, password, and name are required', 400);
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error(res, 'Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find role
    const roleCodeTarget = roleCode || 'ENTREPRENEUR';
    const dbRole = await prisma.role.findUnique({ where: { code: roleCodeTarget } });
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        roles: dbRole ? {
          create: {
            roleId: dbRole.id
          }
        } : undefined
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    const userRoles = user.roles.map(r => r.role.code);
    const token = jwt.sign({ userId: user.id, email: user.email, roles: userRoles }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    return success(res, { user: { id: user.id, email: user.email, name: user.name, roles: userRoles }, token }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { roles: { include: { role: true } } }
    });
    
    if (!user || !user.passwordHash) {
      return error(res, 'Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return error(res, 'Invalid credentials', 401);
    }

    const userRoles = user.roles.map(r => r.role.code);
    const token = jwt.sign({ userId: user.id, email: user.email, roles: userRoles }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    return success(res, { user: { id: user.id, email: user.email, name: user.name, roles: userRoles }, token }, 'Logged in successfully', 200);
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
