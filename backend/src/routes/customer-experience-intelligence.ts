import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/customer-experience-intelligence
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Customer Experience Intelligence module loaded successfully',
      moduleId: '1.61'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
