import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/data-governance
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Data Governance module loaded successfully',
      phase: '1.32'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
