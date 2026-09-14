import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../db.js';

const router = Router();

// POST /api/organizations
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, countryCode } = req.body;
    
    // Create organization and set the creator as the initial member with ADMIN role
    const org = await prisma.organization.create({
      data: {
        name,
        countryCode,
        members: {
          create: {
            userId: req.user!.id,
            membershipRole: 'ADMIN'
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: org
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/organizations
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // Phase 1.2: Tenant Isolation
    // Only fetch organizations this user is a member of
    const orgs = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        members: {
          where: { userId: req.user!.id },
          select: { membershipRole: true }
        }
      }
    });

    res.json({
      success: true,
      data: orgs
    });
  } catch (error) {
    next(error);
  }
});

export default router;
