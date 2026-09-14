import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/service-provider
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Service Provider module loaded successfully',
      moduleId: '1.89'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
