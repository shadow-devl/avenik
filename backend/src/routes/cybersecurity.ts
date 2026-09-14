import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/cybersecurity
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Cybersecurity module loaded successfully',
      phase: '1.24'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
