import { Router, Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';
import { success } from '../utils/response.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';

const router = Router();

// Endpoint to trigger Health Score Calculation (Backward compatible for E2E)
router.post('/calculate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.body.businessId || (req.headers['x-business-id'] as string | undefined);

    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

    const healthRecord = await HealthService.calculateHealth({
      userId: req.user!.userId,
      requestedBusinessId: businessId
    });

    // The legacy test expects healthScore to be in `res.body.data.healthScore`? 
    // Wait, let's see how E2E test checks it: `res.body.data.healthScore`
    // We'll return it formatted perfectly.
    const responseData = {
      ...healthRecord,
      healthScore: healthRecord.score
    };

    success(res, responseData, 'Business health calculated successfully.');
  } catch (error) {
    next(error);
  }
});

// GET latest health
router.get('/current', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await HealthService.getLatestHealth({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, health);
  } catch (error) {
    next(error);
  }
});

export default router;
