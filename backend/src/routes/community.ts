import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/community
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Community module loaded successfully',
      phase: '1.15'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
