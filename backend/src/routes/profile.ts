import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../db.js';
import { success, error } from '../utils/response.js';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  primaryRole: z.string().optional(),
  secondaryRole: z.string().optional()
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.userId }
    });
    
    if (!profile) {
      // Create empty if it doesn't exist yet
      const newProfile = await prisma.userProfile.create({
        data: { userId: req.user!.userId }
      });
      return success(res, newProfile);
    }
    
    success(res, profile);
  } catch (err) {
    next(err);
  }
});

router.put('/', requireAuth, validate(updateProfileSchema, 'body'), async (req, res, next) => {
  try {
    const data = req.body;
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user!.userId },
      update: data,
      create: {
        userId: req.user!.userId,
        ...data
      }
    });
    
    success(res, profile);
  } catch (err) {
    next(err);
  }
});

export const profileRouter = router;
