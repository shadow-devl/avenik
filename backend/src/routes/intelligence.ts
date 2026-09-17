import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { AdaptiveIntelligenceService } from '../services/intelligence/adaptive.service.js';

const router = Router();

// Zod schemas
const businessContextSchema = z.object({
  businessId: z.string().uuid()
});

const executeSchema = z.object({
  businessId: z.string().uuid(),
  actionName: z.string(),
  autonomyLevel: z.number().min(0).max(6)
});

// Detect Changes / Proactive Insights
router.post('/insights/detect', validate(businessContextSchema, 'query'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });
    const insights = await AdaptiveIntelligenceService.detectChanges(businessId as string);
    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
});

// What Matters Now
router.get('/what-matters-now', validate(businessContextSchema, 'query'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });
    const priorities = await AdaptiveIntelligenceService.getWhatMattersNow(businessId as string);
    res.json({ success: true, data: priorities });
  } catch (error) {
    next(error);
  }
});

// Autonomous Execution (Levels 0-6)
router.post('/execute', validate(executeSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await ContextService.resolve({ userId, requestedBusinessId: req.body.businessId });
    const result = await AdaptiveIntelligenceService.executeAutonomousAction(
      req.body.businessId,
      userId,
      req.body.actionName,
      req.body.autonomyLevel
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export const intelligenceRouter = router;
