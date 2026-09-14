import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/government-support-portfolio-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Government Support Portfolio Intelligence module loaded successfully',
      moduleId: '1.75'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
