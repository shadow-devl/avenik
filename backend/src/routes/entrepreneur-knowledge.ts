import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/entrepreneur-knowledge
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Entrepreneur Knowledge module loaded successfully',
      moduleId: '1.56'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
