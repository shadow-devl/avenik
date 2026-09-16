import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ActionService } from '../services/action.service.js';
import { success } from '../utils/response.js';

const router = Router();

const createActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  goalId: z.string().uuid().optional(),
  assigneeUserId: z.string().uuid().optional(),
  type: z.enum(['ACTION', 'CHECKLIST_ITEM']).optional(),
  priority: z.string().optional(),
  dueDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  source: z.string().optional(),
  provenance: z.string().optional(),
  evidenceRequirement: z.string().optional(),
  visibility: z.string().optional(),
  executionPlan: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.string().min(1),
});

const addDependencySchema = z.object({
  dependsOnActionId: z.string().uuid(),
  type: z.enum(['BLOCKS', 'RELATES_TO']).optional(),
});

// GET /api/actions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await ActionService.getActions({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id']?.toString()
    });
    success(res, actions);
  } catch (err) {
    next(err);
  }
});

// POST /api/actions
router.post('/', validate(createActionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const action = await ActionService.createAction({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id']?.toString()
    }, req.body);
    success(res, action, "Created", 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/actions/:id/status
router.put('/:id/status', validate(updateStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const action = await ActionService.updateStatus({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id']?.toString()
    }, req.params.id as string, req.body.status);
    success(res, action);
  } catch (err) {
    next(err);
  }
});

// POST /api/actions/:id/dependencies
router.post('/:id/dependencies', validate(addDependencySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dep = await ActionService.addDependency({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id']?.toString()
    }, req.params.id as string, req.body.dependsOnActionId, req.body.type);
    success(res, dep, "Created", 201);
  } catch (err) {
    next(err);
  }
});

export default router;
