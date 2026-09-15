import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { StrategyService } from '../services/strategy/strategy.service.js';

const router = Router();

const ScenarioSchema = z.object({
  body: z.object({
    businessId: z.string().uuid(),
    scenarioName: z.string(),
    projectedRevenue: z.number().min(0),
    probability: z.number().min(0).max(1)
  })
});

router.post(
  '/scenario',
  validate(ScenarioSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, scenarioName, projectedRevenue, probability } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await StrategyService.generateGrowthScenario(businessId, scenarioName, projectedRevenue, probability);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

export const strategyRouter = router;
