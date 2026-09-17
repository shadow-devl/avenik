import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { ResourceIntelligenceService } from '../services/resources/resource-intelligence.service.js';
import { success } from '../utils/response.js';

const router = Router();

const businessQuerySchema = z.object({
  businessId: z.string().uuid(),
});

router.get('/metrics', requireAuth, validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

    const metrics = await ResourceIntelligenceService.getMetrics(businessId as string);
    success(res, metrics);
  } catch (error) {
    next(error);
  }
});

export const resourceIntelligenceRouter = router;
