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
    res.json({
      success: true,
      data: {
        userId: req.params.userId,
        email: req.user!.email
      }
    });
  } catch (err) {
    next(err);
  }
});

import { prisma } from '../db.js';

// GET /api/users/roles/available
router.get('/roles/available', requireAuth, async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany();
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/roles/me
router.get('/roles/me', requireAuth, async (req, res, next) => {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId: req.user!.userId },
      include: { role: true }
    });
    res.json({ success: true, data: userRoles });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/roles
router.post('/roles', requireAuth, async (req, res, next) => {
  try {
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ success: false, message: 'roleId is required' });
    
    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: req.user!.userId, roleId } }
    });
    
    if (existing) {
      return res.json({ success: true, message: 'Role already assigned' });
    }

    const newUserRole = await prisma.userRole.create({
      data: {
        userId: req.user!.userId,
        roleId
      },
      include: { role: true }
    });
    
    res.json({ success: true, data: newUserRole });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/roles/:roleId
router.delete('/roles/:roleId', requireAuth, async (req, res, next) => {
  try {
    const { roleId } = req.params;
    await prisma.userRole.delete({
      where: { userId_roleId: { userId: req.user!.userId, roleId } }
    });
    res.json({ success: true, message: 'Role removed' });
  } catch (err) {
    // ignore if doesn't exist
    res.json({ success: true, message: 'Role removed or not found' });
  }
});

export default router;
