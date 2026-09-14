import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/marketing-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Marketing Intelligence module loaded successfully',
      moduleId: '1.44'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
