import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/entrepreneur-support-intelligence-center
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Entrepreneur Support Intelligence Center module loaded successfully',
      moduleId: '1.78'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
