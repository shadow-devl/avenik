import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/reports
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Reports module loaded successfully',
      phase: '1.28'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
