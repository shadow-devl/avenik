import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/human-capital-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Human Capital Intelligence module loaded successfully',
      moduleId: '1.46'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
