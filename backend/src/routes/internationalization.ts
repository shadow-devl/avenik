import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/internationalization
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Internationalization module loaded successfully',
      moduleId: '1.93'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
