import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
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
    const insights = await AdaptiveIntelligenceService.detectChanges(businessId as string);
    res.json({ status: 'success', data: insights });
  } catch (error) {
    next(error);
  }
});

// What Matters Now
router.get('/what-matters-now', validate(businessContextSchema, 'query'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    const priorities = await AdaptiveIntelligenceService.getWhatMattersNow(businessId as string);
    res.json({ status: 'success', data: priorities });
  } catch (error) {
    next(error);
  }
});

// Autonomous Execution (Levels 0-6)
router.post('/execute', validate(executeSchema), async (req, res, next) => {
  try {
    // In real app, userId comes from auth token
    const userId = req.body.businessId; 
    const result = await AdaptiveIntelligenceService.executeAutonomousAction(
      req.body.businessId,
      userId,
      req.body.actionName,
      req.body.autonomyLevel
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

export const intelligenceRouter = router;
