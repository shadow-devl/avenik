import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/advanced-risk
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Advanced Risk module loaded successfully',
      moduleId: '1.96'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
