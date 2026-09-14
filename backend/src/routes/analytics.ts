import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/analytics
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Analytics module loaded successfully',
      phase: '1.21'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
