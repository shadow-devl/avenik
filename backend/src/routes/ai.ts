import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { AutonomousIntelligenceService } from '../services/ai/autonomous-intelligence.service.js';
import { CopilotService } from '../services/ai/copilot.service.js';
import { success } from '../utils/response.js';

const router = Router();

const businessQuerySchema = z.object({
  businessId: z.string().uuid(),
});

const chatSchema = z.object({
  businessId: z.string().uuid(),
  message: z.string().min(1)
});

// Trigger autonomous signal generation (usually called by cron, but we expose an endpoint for testing)
router.post('/generate-signals', requireAuth, validate(businessQuerySchema, 'body'), async (req, res, next) => {
  try {
    const { businessId } = req.body;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

    const signals = await AutonomousIntelligenceService.triggerSignalGeneration(businessId as string);
    success(res, { message: `Generated ${signals.length} intelligence signals autonomously.`, signals });
  } catch (error) {
    next(error);
  }
});

// Copilot Chat
router.post('/chat', requireAuth, validate(chatSchema, 'body'), async (req, res, next) => {
  try {
    const { businessId, message } = req.body;
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

    const response = await CopilotService.chat(businessId as string, message as string);
    success(res, response);
  } catch (error) {
    next(error);
  }
});

export const aiRouter = router;
