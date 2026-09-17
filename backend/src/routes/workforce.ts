import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { WorkforceService } from '../services/workforce/workforce.service.js';
import { PredictiveWorkforceService } from '../services/workforce/predictive-workforce.service.js';

const router = Router();

const CapacitySchema = z.object({
  body: z.object({
    businessId: z.string().uuid(),
    roleName: z.string(),
    currentFTE: z.number().min(0),
    requiredFTE: z.number().min(0)
  })
});

const GapSchema = z.object({
  body: z.object({
    businessId: z.string().uuid(),
    skillName: z.string(),
    currentLevel: z.number().min(0).max(5),
    requiredLevel: z.number().min(0).max(5)
  })
});

router.post(
  '/capacity',
  validate(CapacitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, roleName, currentFTE, requiredFTE } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await WorkforceService.assessCapacity(businessId, roleName, currentFTE, requiredFTE);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/gap',
  validate(GapSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, skillName, currentLevel, requiredLevel } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await WorkforceService.identifyCapabilityGap(businessId, skillName, currentLevel, requiredLevel);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/metrics',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query.businessId as string || req.headers['x-business-id'] as string;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await WorkforceService.getWorkforceMetrics(businessId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/predict',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, horizonMonths } = req.body;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required' });
      }
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const forecast = await PredictiveWorkforceService.generateForecast(businessId, horizonMonths || 6);
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }
);

export const workforceRouter = router;
