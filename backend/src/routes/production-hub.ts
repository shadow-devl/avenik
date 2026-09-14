import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/production-hub
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Production Hub module loaded successfully',
      moduleId: '1.100'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
