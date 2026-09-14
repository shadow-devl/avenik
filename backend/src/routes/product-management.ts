import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/product-management
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Product Management module loaded successfully',
      moduleId: '1.91'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
