import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/resource-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Resource Intelligence module loaded successfully',
      moduleId: '1.88'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
