import { Router, Request, Response, NextFunction } from 'express';
import { MemoryService } from '../services/memory.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memories = await MemoryService.getMemories({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, memories);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memory = await MemoryService.upsertMemory(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.body.key,
      req.body.value,
      req.body.category,
      req.body.sourceType
    );
    success(res, memory, 'Memory updated', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
