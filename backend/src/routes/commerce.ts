import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { CommerceService } from '../services/commerce/commerce.service.js';
import { prisma } from '../db.js';

const router = Router();

const EvaluateMarketSchema = z.object({
  body: z.object({
    businessId: z.string().uuid(),
    targetMarket: z.string().min(2)
  })
});

const GetPlansSchema = z.object({
  query: z.object({
    businessId: z.string().uuid()
  })
});

/**
 * POST /api/commerce/evaluate-market
 * Triggers market expansion intelligence scoring and creates a CommercialExpansionPlan
 */
router.post(
  '/evaluate-market',
  validate(EvaluateMarketSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, targetMarket } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await CommerceService.evaluateExpansionViability(businessId, targetMarket);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/commerce/expansion-plans
 * Retrieves expansion plans for the given business
 */
router.get(
  '/expansion-plans',
  validate(GetPlansSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.query;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

      const plans = await prisma.commercialExpansionPlan.findMany({
        where: { businessId: businessId as string },
        include: { segments: true, pricingScenarios: true }
      });
      res.json({ status: 'success', data: plans });
    } catch (error) {
      next(error);
    }
  }
);

export const commerceRouter = router;
