import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/ai-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'AI Intelligence module loaded successfully',
      phase: '1.16'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
