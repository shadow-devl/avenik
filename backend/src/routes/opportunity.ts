import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/opportunity
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Opportunity module loaded successfully',
      moduleId: '1.90'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
