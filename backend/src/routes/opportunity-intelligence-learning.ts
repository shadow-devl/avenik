import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/opportunity-intelligence-learning
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Opportunity Intelligence Learning module loaded successfully',
      moduleId: '1.71'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
