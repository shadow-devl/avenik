import { Router, Request, Response, NextFunction } from 'express';
import { ContextService } from '../services/context.service.js';
import { success } from '../utils/response.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Endpoint for the unified context engine
// In production, requireAuth middleware provides req.user
router.get('/current', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { businessId, organizationId, roleId } = req.query;

    const unifiedContext = await ContextService.resolve({
      userId,
      requestedBusinessId: businessId as string | undefined,
      requestedOrganizationId: organizationId as string | undefined,
      requestedRoleId: roleId as string | undefined
    });

    success(res, unifiedContext, 'Unified Context resolved successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
