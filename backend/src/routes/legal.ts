import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/legal
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Legal module loaded successfully',
      moduleId: '1.92'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
