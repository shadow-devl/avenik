import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-secure-knowledge
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Secure Knowledge module loaded successfully',
      moduleId: '1.84'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
