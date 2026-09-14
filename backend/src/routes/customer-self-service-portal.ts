import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-self-service-portal
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Self-service Portal module loaded successfully',
      moduleId: '1.65'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
