import { Router, Request, Response, NextFunction } from 'express';
import { TrustService } from '../services/trust.service.js';
import { PredictiveRiskService } from '../services/trust/predictive-risk.service.js';
import { success } from '../utils/response.js';
import { ContextService } from '../services/context.service.js';

const router = Router();

router.post('/verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await TrustService.submitVerificationClaim(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.body
    );
    success(res, claim, 'Verification claim submitted', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await TrustService.getVerificationClaims({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, claims);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/trust/threat-matrix
 * AI-driven threat evaluation across fraud, cyber, and operational risk.
 */
router.post('/threat-matrix', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

    const matrix = await PredictiveRiskService.evaluateThreatMatrix(businessId);
    res.json({ success: true, data: matrix });
  } catch (error) {
    next(error);
  }
});

export const trustRouter = router;
export default router;
