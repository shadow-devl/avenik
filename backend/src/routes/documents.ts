import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/documents
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Documents module loaded successfully',
      phase: '1.23'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
