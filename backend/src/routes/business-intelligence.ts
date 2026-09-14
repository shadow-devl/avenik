import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/business-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Business Intelligence module loaded successfully',
      phase: '1.40'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
