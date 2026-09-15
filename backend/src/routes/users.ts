import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requirePolicy, isResourceOwner } from '../middleware/requirePolicy.js';
import { AppError } from '../middleware/errorHandler.js';
// We don't have prisma exported in a db file yet in backend. Let's create one.

const router = Router();

// GET /api/users/me -> Handled by auth route or here
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// GET /api/users/:userId/profile
router.get('/:userId/profile', requireAuth, requirePolicy(isResourceOwner('userId')), async (req, res, next) => {
  try {
    // Database implementation would fetch the user profile here.
    // For now, we mock the return to prove the ABAC policy works.
    res.json({
      success: true,
      data: {
        userId: req.params.userId,
        firstName: "Mock",
        lastName: "User",
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
