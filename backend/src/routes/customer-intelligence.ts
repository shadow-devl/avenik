import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { CustomerIntelligenceService } from '../services/customer/customer-intelligence.service.js';
import { success } from '../utils/response.js';

const router = Router();

const businessQuerySchema = z.object({
  businessId: z.string().uuid(),
});

router.get('/metrics', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

    const metrics = await CustomerIntelligenceService.getCustomerMetrics(businessId as string);
    success(res, metrics);
  } catch (error) {
    next(error);
  }
});

export const customerIntelligenceRouter = router;
