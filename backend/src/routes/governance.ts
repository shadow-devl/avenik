import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/governance
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Platform Governance module loaded successfully',
      phase: '1.31'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
