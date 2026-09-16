import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { GoalService } from '../services/goal.service.js';
import { success } from '../utils/response.js';

const router = Router();

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  type: z.enum(['GOAL', 'OBJECTIVE', 'MILESTONE']).optional(),
  parentGoalId: z.string().uuid().optional(),
  targetDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  baseline: z.number().optional(),
  target: z.number().optional(),
  unit: z.string().optional(),
  priority: z.string().optional(),
  visibility: z.string().optional(),
});

const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

// GET /api/goals
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await GoalService.getGoals({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, goals);
  } catch (err) {
    next(err);
  }
});

// POST /api/goals
router.post('/', validate(createGoalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await GoalService.createGoal({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.body);
    success(res, goal, "Created", 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/goals/:id/progress
router.put('/:id/progress', validate(updateProgressSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await GoalService.updateProgress({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.params.id as string, req.body.progress);
    success(res, goal);
  } catch (err) {
    next(err);
  }
});

export default router;
