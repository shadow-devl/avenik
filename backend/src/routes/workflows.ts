import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/workflows
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Workflow Orchestration module loaded successfully',
      phase: '1.33'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
