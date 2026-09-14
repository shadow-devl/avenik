import { Router, Request, Response, NextFunction } from 'express';
import { EarlyWarningService } from '../services/early-warning.service.js';
import { success } from '../utils/response.js';

const router = Router();

router.post('/check', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warnings = await EarlyWarningService.checkWarnings({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, warnings, "Checked", 201);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warnings = await EarlyWarningService.getWarnings({
      userId: req.user!.userId,
      requestedBusinessId: req.headers['x-business-id'] as string | undefined
    });
    success(res, warnings);
  } catch (error) {
    next(error);
  }
});

export default router;
