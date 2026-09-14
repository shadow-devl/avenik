import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-global-entrepreneur-profile
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Global Entrepreneur Profile module loaded successfully',
      moduleId: '1.83'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
