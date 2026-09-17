import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { PredictivePartnerService } from '../services/partner/predictive-partner.service.js';

const router = Router();

// GET /api/partner
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      message: 'Partner module loaded successfully',
      moduleId: '1.45'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/partner/match
 * AI-driven Partner & Ecosystem Intelligence.
 */
router.post('/match', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

    const matchData = await PredictivePartnerService.evaluateEcosystemMatches(businessId);
    res.json({ success: true, data: matchData });
  } catch (error) {
    next(error);
  }
});

export const partnerRouter = router;
export default router;
