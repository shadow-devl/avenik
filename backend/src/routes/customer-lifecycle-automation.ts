import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-lifecycle-automation
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Lifecycle Automation module loaded successfully',
      moduleId: '1.63'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
