import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { SelfServicePortalService } from '../services/customer/self-service.service.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Self Service module loaded' });
});

router.post('/analyze', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });
    const data = await SelfServicePortalService.analyze(businessId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export const selfServiceRouter = router;
export default router;
