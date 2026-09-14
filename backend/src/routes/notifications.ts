import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Notifications module loaded successfully',
      phase: '1.22'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
