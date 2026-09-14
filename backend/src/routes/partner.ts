import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/partner
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Partner module loaded successfully',
      moduleId: '1.47'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
