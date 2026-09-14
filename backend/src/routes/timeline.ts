import { Router, Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await TimelineService.getEvents({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, events);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await TimelineService.addEvent(
      {
        userId: req.user!.userId,
        requestedBusinessId: req.headers['x-business-id'] as string | undefined
      },
      req.body
    );
    success(res, event, 'Event added', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
