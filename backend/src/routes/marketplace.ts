import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/marketplace
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Ecosystem Marketplace module loaded successfully',
      phase: '1.34'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
