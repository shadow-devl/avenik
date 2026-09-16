import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../db.js';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { legalName, displayName, countryCode } = req.body;
    
    // Create business and set the user as owner
    const business = await prisma.business.create({
      data: {
        legalName,
        displayName,
        countryCode,
        ownerUserId: req.user!.userId,
        businessStatus: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    next(error);
  }
});

export default router;
