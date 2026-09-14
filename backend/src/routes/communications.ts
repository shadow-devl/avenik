import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/communications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Multi-Channel Communication module loaded successfully',
      phase: '1.39'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
