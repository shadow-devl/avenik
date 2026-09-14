import { Router, Request, Response, NextFunction } from 'express';
import { FundingService } from '../services/funding.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.post('/requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await FundingService.createFundingRequest(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.body
    );
    success(res, request, 'Funding request created', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await FundingService.getFundingRequests({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, requests);
  } catch (error) {
    next(error);
  }
});

router.post('/requests/:id/options', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const option = await FundingService.addFundingOption(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.params.id as string,
      req.body
    );
    success(res, option, 'Funding option added', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
