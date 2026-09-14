import { Router, Request, Response, NextFunction } from 'express';
import { ForecastService } from '../services/forecast.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forecasts = await ForecastService.generateForecast({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, forecasts, "Generated", 201);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forecasts = await ForecastService.getForecasts({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, forecasts);
  } catch (error) {
    next(error);
  }
});

export default router;
