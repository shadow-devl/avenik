import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { CapitalService } from '../services/finance/capital.service.js';
import { ScenarioService } from '../services/finance/scenario.service.js';

const router = Router();

const BusinessQuerySchema = z.object({
  businessId: z.string().uuid()
});

const DebtScenarioSchema = z.object({
  businessId: z.string().uuid(),
  principal: z.number().positive(),
  annualInterestRate: z.number().min(0),
  tenureMonths: z.number().int().positive()
});

const EquityScenarioSchema = z.object({
  businessId: z.string().uuid(),
  currentValuation: z.number().positive(),
  investmentAmount: z.number().positive(),
  currentFounderOwnershipPct: z.number().min(0).max(100)
});

/**
 * GET /api/finance/capital-gap
 * Returns the calculated capital gap
 */
router.get(
  '/capital-gap',
  validate(BusinessQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.query;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

      const gapInfo = await CapitalService.calculateCapitalGap(businessId as string);
      res.json({ status: 'success', data: gapInfo });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/finance/readiness
 * Returns the financial readiness scorecard
 */
router.get(
  '/readiness',
  validate(BusinessQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.query;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

      const readiness = await CapitalService.assessReadiness(businessId as string);
      res.json({ status: 'success', data: readiness });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/finance/scenario/debt
 * Calculates EMI scenario for debt financing
 */
router.post(
  '/scenario/debt',
  validate(DebtScenarioSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, principal, annualInterestRate, tenureMonths } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const scenario = ScenarioService.calculateDebtScenario(principal, annualInterestRate, tenureMonths);
      res.json({ status: 'success', data: scenario });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/finance/scenario/equity
 * Calculates equity dilution scenario for equity financing
 */
router.post(
  '/scenario/equity',
  validate(EquityScenarioSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, currentValuation, investmentAmount, currentFounderOwnershipPct } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const scenario = ScenarioService.calculateEquityScenario(
        currentValuation,
        investmentAmount,
        currentFounderOwnershipPct
      );
      res.json({ status: 'success', data: scenario });
    } catch (error) {
      next(error);
    }
  }
);

export const financeRouter = router;
