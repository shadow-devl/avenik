import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/government-support-lifecycle-automation
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Government Support Lifecycle Automation module loaded successfully',
      moduleId: '1.76'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
