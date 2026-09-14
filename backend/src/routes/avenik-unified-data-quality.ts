import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-unified-data-quality
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Unified Data Quality module loaded successfully',
      moduleId: '1.81'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
