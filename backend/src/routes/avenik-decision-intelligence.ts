import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-decision-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Decision Intelligence module loaded successfully',
      moduleId: '1.80'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
