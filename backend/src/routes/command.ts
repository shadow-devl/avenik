import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { CommandService } from '../services/command/command.service.js';

const router = Router();

const SummarySchema = z.object({
  query: z.object({
    businessId: z.string().uuid()
  })
});

router.get(
  '/summary',
  validate(SummarySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.query;
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

      const result = await CommandService.generateUnifiedSummary(businessId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

export const commandRouter = router;
