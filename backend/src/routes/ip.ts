import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/ip
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Intellectual Property module loaded successfully',
      phase: '1.19'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
