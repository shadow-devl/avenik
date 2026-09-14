import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/growth-planning
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Growth Planning module loaded successfully',
      phase: '1.42'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
