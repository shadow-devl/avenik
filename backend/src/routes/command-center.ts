import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/command-center
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Command Center module loaded successfully',
      phase: '1.41'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
