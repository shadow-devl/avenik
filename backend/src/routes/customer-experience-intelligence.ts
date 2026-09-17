import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { CustomerExperienceService } from '../services/customer/customer-experience.service.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'CX module loaded' });
});

router.post('/analyze', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });
    const data = await CustomerExperienceService.analyze(businessId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export const customerExperienceRouter = router;
export default router;
