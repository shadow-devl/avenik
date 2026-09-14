import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Intelligence module loaded successfully',
      phase: '1.43'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
