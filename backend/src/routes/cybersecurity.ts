import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { CybersecurityService } from '../services/security/cybersecurity.service.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Cybersecurity module loaded' });
});

router.post('/analyze', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });
    const data = await CybersecurityService.analyze(businessId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export const cybersecurityRouter = router;
export default router;
