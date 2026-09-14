import { Router, Request, Response, NextFunction } from 'express';
import { DecisionService } from '../services/decision.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decisions = await DecisionService.getDecisions({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, decisions);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await DecisionService.createDecision({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.body);
    success(res, decision, 'Decision created', 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await DecisionService.updateDecision({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.params.id as string, req.body);
    success(res, decision);
  } catch (error) {
    next(error);
  }
});

export default router;
