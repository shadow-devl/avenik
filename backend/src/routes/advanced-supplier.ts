import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/advanced-supplier
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Advanced Supplier module loaded successfully',
      moduleId: '1.48'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
