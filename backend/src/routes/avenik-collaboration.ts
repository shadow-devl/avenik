import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-collaboration
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Collaboration module loaded successfully',
      moduleId: '1.85'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
