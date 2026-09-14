import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/government-support-portfolio
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Government Support Portfolio module loaded successfully',
      moduleId: '1.74'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
