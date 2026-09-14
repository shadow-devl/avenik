import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/market-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Market Intelligence module loaded successfully',
      phase: '1.17'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
