import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { OperationsService } from '../services/operations/operations.service.js';

const router = Router();

const RiskSchema = z.object({
  body: z.object({
    businessId: z.string().uuid(),
    riskArea: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  })
});

router.post(
  '/risk',
  validate(RiskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, riskArea, severity } = req.body;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const result = await OperationsService.evaluateRisk(businessId, riskArea, severity);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

export const operationsRouter = router;
