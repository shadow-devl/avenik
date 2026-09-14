import { Router, Request, Response, NextFunction } from 'express';
import { FraudService } from '../services/fraud.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.post('/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fcase = await FraudService.reportFraud(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.body
    );
    success(res, fcase, 'Fraud reported', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cases = await FraudService.getFraudCases({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, cases);
  } catch (error) {
    next(error);
  }
});

export default router;
