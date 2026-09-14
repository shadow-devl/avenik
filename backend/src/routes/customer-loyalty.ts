import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-loyalty
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Loyalty module loaded successfully',
      moduleId: '1.59'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
