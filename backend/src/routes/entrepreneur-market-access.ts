import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/entrepreneur-market-access
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Entrepreneur Market Access module loaded successfully',
      moduleId: '1.52'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
