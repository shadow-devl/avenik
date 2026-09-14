import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/entrepreneur-customer-business-portal-unification
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Entrepreneur Customer/business Portal Unification module loaded successfully',
      moduleId: '1.66'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
