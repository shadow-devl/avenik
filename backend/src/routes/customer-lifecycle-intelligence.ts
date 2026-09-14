import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-lifecycle-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Lifecycle Intelligence module loaded successfully',
      moduleId: '1.60'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
