import { Router, Request, Response, NextFunction } from 'express';
import { GraphService } from '../services/graph.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const graph = await GraphService.getBusinessGraph({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, graph);
  } catch (error) {
    next(error);
  }
});

export default router;
