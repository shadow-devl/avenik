import { Router, Request, Response, NextFunction } from 'express';
import { TrustService } from '../services/trust.service.js';
import { success } from '../utils/response.js';

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

export default router;
