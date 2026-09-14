import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/international
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'International Expansion module loaded successfully',
      phase: '1.18'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
