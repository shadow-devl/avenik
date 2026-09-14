import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/university
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'University module loaded successfully',
      phase: '1.14'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
