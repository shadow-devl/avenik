import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/wellness
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Founder Wellness module loaded successfully',
      phase: '1.26'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
