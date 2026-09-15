import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { SignalFabricService } from '../services/evolution/signal-fabric.service.js';
import { AgentWorkforceService } from '../services/evolution/agent-workforce.service.js';
import { SimulationService } from '../services/evolution/simulation.service.js';
import { CompetitiveIntelService } from '../services/evolution/competitive-intel.service.js';

const router = Router();

// ── Schemas ──

const businessQuerySchema = z.object({ businessId: z.string().uuid() });

const signalCreateSchema = z.object({
  businessId: z.string().uuid(),
  domain: z.string(),
  signalType: z.string(),
  title: z.string(),
  description: z.string().optional(),
  impact: z.string().optional(),
  urgency: z.string().optional(),
  confidence: z.number().optional(),
  evidence: z.array(z.any()).optional(),
  explanation: z.any().optional(),
});

const signalStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
});

const agentTaskSchema = z.object({
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
  agentType: z.string(),
  purpose: z.string(),
  autonomyLevel: z.number().optional(),
  tools: z.array(z.string()).optional(),
  riskLevel: z.string().optional(),
  budget: z.object({
    maxToolCalls: z.number().optional(),
    maxDuration: z.number().optional(),
  }).optional(),
});

const taskActionSchema = z.object({
  taskId: z.string().uuid(),
  approvedBy: z.string().optional(),
});

const simulationCreateSchema = z.object({
  businessId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  scenarioType: z.string(),
  assumptions: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
});

const competitiveIntelSchema = z.object({
  businessId: z.string().uuid(),
  competitorName: z.string(),
  domain: z.string(),
  insight: z.string(),
  confidence: z.number().optional(),
  source: z.string().optional(),
  impactOnBusiness: z.string().optional(),
});

// ── 13.1 Intelligence Signal Routes ──

router.post('/signals', validate(signalCreateSchema), async (req, res, next) => {
  try {
    const signal = await SignalFabricService.createSignal(req.body.businessId, req.body);
    res.json({ status: 'success', data: signal });
  } catch (error) { next(error); }
});

router.get('/signals', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const signals = await SignalFabricService.getPrioritizedSignals(q.businessId, {
      domain: q.domain, status: q.status,
    });
    res.json({ status: 'success', data: signals });
  } catch (error) { next(error); }
});

router.get('/signals/state', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const state = await SignalFabricService.getBusinessState(req.query.businessId as string);
    res.json({ status: 'success', data: state });
  } catch (error) { next(error); }
});

router.patch('/signals/status', validate(signalStatusSchema), async (req, res, next) => {
  try {
    const signal = await SignalFabricService.updateSignalStatus(req.body.id, req.body.status);
    res.json({ status: 'success', data: signal });
  } catch (error) { next(error); }
});

// ── 13.2 Agent Task Routes ──

router.post('/agents/tasks', validate(agentTaskSchema), async (req, res, next) => {
  try {
    const task = await AgentWorkforceService.createTask(req.body);
    res.json({ status: 'success', data: task });
  } catch (error) { next(error); }
});

router.get('/agents/tasks', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const tasks = await AgentWorkforceService.getTasks(q.businessId, {
      status: q.status, agentType: q.agentType,
    });
    res.json({ status: 'success', data: tasks });
  } catch (error) { next(error); }
});

router.post('/agents/tasks/approve', validate(taskActionSchema), async (req, res, next) => {
  try {
    const task = await AgentWorkforceService.approveTask(req.body.taskId, req.body.approvedBy || 'system');
    res.json({ status: 'success', data: task });
  } catch (error) { next(error); }
});

router.post('/agents/tasks/execute', validate(taskActionSchema), async (req, res, next) => {
  try {
    const task = await AgentWorkforceService.executeTask(req.body.taskId);
    res.json({ status: 'success', data: task });
  } catch (error) { next(error); }
});

router.post('/agents/tasks/cancel', validate(taskActionSchema), async (req, res, next) => {
  try {
    const task = await AgentWorkforceService.cancelTask(req.body.taskId);
    res.json({ status: 'success', data: task });
  } catch (error) { next(error); }
});

// ── 13.3 Simulation Routes ──

router.post('/simulations', validate(simulationCreateSchema), async (req, res, next) => {
  try {
    const sim = await SimulationService.create(req.body.businessId, req.body);
    res.json({ status: 'success', data: sim });
  } catch (error) { next(error); }
});

router.get('/simulations', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const sims = await SimulationService.getSimulations(q.businessId, { scenarioType: q.scenarioType });
    res.json({ status: 'success', data: sims });
  } catch (error) { next(error); }
});

router.post('/simulations/run', validate(z.object({ id: z.string().uuid() })), async (req, res, next) => {
  try {
    const sim = await SimulationService.runSimulation(req.body.id);
    res.json({ status: 'success', data: sim });
  } catch (error) { next(error); }
});

// ── 13.4 Competitive Intel Routes ──

router.post('/competitive', validate(competitiveIntelSchema), async (req, res, next) => {
  try {
    const intel = await CompetitiveIntelService.addIntel(req.body.businessId, req.body);
    res.json({ status: 'success', data: intel });
  } catch (error) { next(error); }
});

router.get('/competitive', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const intel = await CompetitiveIntelService.getLandscape(q.businessId, {
      competitorName: q.competitorName, domain: q.domain,
    });
    res.json({ status: 'success', data: intel });
  } catch (error) { next(error); }
});

router.get('/competitive/summary', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const summary = await CompetitiveIntelService.getSummary(req.query.businessId as string);
    res.json({ status: 'success', data: summary });
  } catch (error) { next(error); }
});

export const evolutionRouter = router;
