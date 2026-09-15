import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { GlobalPlatformService } from '../services/evolution/global-platform.service.js';

const router = Router();

const businessQuerySchema = z.object({ businessId: z.string().uuid() });

// ── Ecosystem ──
router.post('/network', validate(z.object({
  businessId: z.string().uuid(), networkType: z.string(), region: z.string(), metadata: z.any().optional()
})), async (req, res, next) => {
  try {
    const network = await GlobalPlatformService.registerEcosystemNetwork(req.body.businessId, req.body);
    res.json({ status: 'success', data: network });
  } catch (error) { next(error); }
});

router.get('/network', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const networks = await GlobalPlatformService.getNetworks(req.query.businessId as string);
    res.json({ status: 'success', data: networks });
  } catch (error) { next(error); }
});

// ── Intelligence Nodes ──
router.post('/nodes', validate(z.object({
  businessId: z.string().uuid(), nodeRole: z.string(), autonomyLevel: z.number().optional()
})), async (req, res, next) => {
  try {
    const node = await GlobalPlatformService.deployIntelligenceNode(req.body.businessId, req.body.nodeRole, req.body.autonomyLevel || 3);
    res.json({ status: 'success', data: node });
  } catch (error) { next(error); }
});

// ── Economic Engine ──
router.post('/economics/simulate', validate(z.object({
  businessId: z.string().uuid(), scenarioName: z.string(), macroFactors: z.any()
})), async (req, res, next) => {
  try {
    const sim = await GlobalPlatformService.runEconomicSimulation(req.body.businessId, req.body.scenarioName, req.body.macroFactors);
    res.json({ status: 'success', data: sim });
  } catch (error) { next(error); }
});

export const globalPlatformRouter = router;
