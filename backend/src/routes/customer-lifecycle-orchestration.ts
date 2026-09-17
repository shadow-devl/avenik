import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { PredictiveLifecycleService } from '../services/customer/predictive-lifecycle.service.js';

const router = Router();

// GET /api/customer-lifecycle-orchestration
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      message: 'Customer Lifecycle Orchestration module loaded successfully',
      moduleId: '1.62'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/customer-lifecycle-orchestration/orchestrate
 * Analyzes customer segments to predict churn and generate automated tracks.
 */
router.post('/orchestrate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

    const orchestration = await PredictiveLifecycleService.orchestrateLifecycle(businessId);
    res.json({ success: true, data: orchestration });
  } catch (error) {
    next(error);
  }
});

export const customerLifecycleOrchestrationRouter = router;
export default router;
