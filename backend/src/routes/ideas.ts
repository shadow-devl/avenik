import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/ideas
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Ideas module loaded successfully',
      phase: '1.30'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
