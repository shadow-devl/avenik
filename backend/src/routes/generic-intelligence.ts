import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { GenericIntelligenceService } from '../services/unified/generic-intelligence.service.js';
import { success } from '../utils/response.js';

const router = Router();

const genericQuerySchema = z.object({
  businessId: z.string().uuid(),
  domain: z.string()
});

router.get('/metrics', requireAuth, validate(genericQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { businessId, domain } = req.query;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

    const metrics = await GenericIntelligenceService.getMetrics(businessId as string, domain as string);
    success(res, metrics);
  } catch (error) {
    next(error);
  }
});

export const genericIntelligenceRouter = router;
