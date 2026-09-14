import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/avenik-communication
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Avenik Communication module loaded successfully',
      moduleId: '1.87'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
