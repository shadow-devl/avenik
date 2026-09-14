import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/sustainability
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Sustainability module loaded successfully',
      phase: '1.20'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
