import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/entrepreneur-digital-twin
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Entrepreneur Digital Twin module loaded successfully',
      moduleId: '1.97'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
