import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/product
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Product module loaded successfully',
      moduleId: '1.54'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
