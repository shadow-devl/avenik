import { PredictiveWorkforceService } from '../services/workforce/predictive-workforce.service.js';

router.post(
  '/predict',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, horizonMonths } = req.body;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required' });
      }
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      const forecast = await PredictiveWorkforceService.generateForecast(businessId, horizonMonths || 6);
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }
);

export const workforceRouter = router;
