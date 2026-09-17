import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { ContextService } from '../services/context.service.js';
import { InnovationEngineService } from '../services/product/innovation-engine.service.js';

const router = Router();

// GET /api/product-management
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      message: 'Product Management module loaded successfully',
      moduleId: '1.43'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/product-management/innovation
 * AI-driven Product Innovation Engine mapping market gaps to the product pipeline.
 */
router.post('/innovation', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

    const innovation = await InnovationEngineService.evaluatePipeline(businessId);
    res.json({ success: true, data: innovation });
  } catch (error) {
    next(error);
  }
});

export const productManagementRouter = router;
export default router;
