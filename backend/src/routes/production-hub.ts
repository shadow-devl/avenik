import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { ProductionHubService } from '../services/production/production-hub.service.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Production Hub module loaded' });
});

router.post('/optimize', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });
    const data = await ProductionHubService.optimizeProduction(businessId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export const productionHubRouter = router;
export default router;
