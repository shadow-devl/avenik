import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/applications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Application Assistance module loaded successfully',
      phase: '1.38'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
