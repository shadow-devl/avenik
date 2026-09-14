import { Router, Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recs = await RecommendationService.getRecommendations({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, recs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rec = await RecommendationService.getRecommendation({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.params.id as string);
    success(res, rec);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rec = await RecommendationService.updateStatus({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    }, req.params.id as string, req.body.status);
    success(res, rec);
  } catch (error) {
    next(error);
  }
});

export default router;
