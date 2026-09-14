import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/workforce
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Workforce module loaded successfully',
      moduleId: '1.95'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
