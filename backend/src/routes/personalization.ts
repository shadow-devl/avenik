import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/personalization
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Personalization module loaded successfully',
      phase: '1.27'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
