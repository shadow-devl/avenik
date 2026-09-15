import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { DigitalTwinService } from '../services/maturity/digital-twin.service.js';
import { AnomalyService } from '../services/maturity/anomaly.service.js';
import { InnovationService } from '../services/maturity/innovation.service.js';
import { GovernanceService } from '../services/maturity/governance.service.js';

const router = Router();

// ── Schemas ──

const businessQuerySchema = z.object({
  businessId: z.string().uuid(),
});

const digitalTwinSyncSchema = z.object({
  userId: z.string().uuid(),
  businessId: z.string().uuid(),
});

const preferencesSchema = z.object({
  userId: z.string().uuid(),
  businessId: z.string().uuid(),
  preferences: z.record(z.string(), z.any()),
});

const anomalyFilterSchema = z.object({
  businessId: z.string().uuid(),
  domain: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
});

const anomalyUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  rootCause: z.string().optional(),
});

const innovationCreateSchema = z.object({
  businessId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const innovationUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  result: z.string().optional(),
  learning: z.string().optional(),
});

const policySchema = z.object({
  businessId: z.string().uuid(),
  domain: z.string(),
  policyName: z.string(),
  description: z.string().optional(),
  controlType: z.string().optional(),
  owner: z.string().optional(),
  evidenceRequired: z.boolean().optional(),
  reviewFrequency: z.string().optional(),
  riskLevel: z.string().optional(),
  mitigations: z.array(z.any()).optional(),
});

const agentEvalSchema = z.object({
  businessId: z.string().uuid(),
  agentName: z.string(),
  tool: z.string(),
  domain: z.string(),
  riskLevel: z.string(),
});

// ── 12.1 Digital Twin Routes ──

router.post('/digital-twin/sync', validate(digitalTwinSyncSchema), async (req, res, next) => {
  try {
    const twin = await DigitalTwinService.syncDigitalTwin(req.body.userId, req.body.businessId);
    res.json({ status: 'success', data: twin });
  } catch (error) { next(error); }
});

router.get('/digital-twin', validate(digitalTwinSyncSchema, 'query'), async (req, res, next) => {
  try {
    const twin = await DigitalTwinService.getDigitalTwin(req.query.userId as string, req.query.businessId as string);
    res.json({ status: 'success', data: twin });
  } catch (error) { next(error); }
});

router.put('/digital-twin/preferences', validate(preferencesSchema), async (req, res, next) => {
  try {
    const twin = await DigitalTwinService.updatePreferences(req.body.userId, req.body.businessId, req.body.preferences);
    res.json({ status: 'success', data: twin });
  } catch (error) { next(error); }
});

// ── 12.2 Anomaly Detection Routes ──

router.post('/anomalies/detect', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const anomalies = await AnomalyService.detectAnomalies(req.query.businessId as string);
    res.json({ status: 'success', data: anomalies });
  } catch (error) { next(error); }
});

router.get('/anomalies', validate(anomalyFilterSchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const anomalies = await AnomalyService.getAnomalies(q.businessId, {
      domain: q.domain, severity: q.severity, status: q.status,
    });
    res.json({ status: 'success', data: anomalies });
  } catch (error) { next(error); }
});

router.patch('/anomalies', validate(anomalyUpdateSchema), async (req, res, next) => {
  try {
    const anomaly = await AnomalyService.updateAnomalyStatus(req.body.id, req.body.status, req.body.rootCause);
    res.json({ status: 'success', data: anomaly });
  } catch (error) { next(error); }
});

// ── 12.7 Innovation Routes ──

router.post('/innovation', validate(innovationCreateSchema), async (req, res, next) => {
  try {
    const record = await InnovationService.create(req.body.businessId, req.body);
    res.json({ status: 'success', data: record });
  } catch (error) { next(error); }
});

router.get('/innovation', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const records = await InnovationService.getPortfolio(q.businessId, {
      type: q.type, status: q.status,
    });
    res.json({ status: 'success', data: records });
  } catch (error) { next(error); }
});

router.get('/innovation/summary', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const summary = await InnovationService.getSummary(req.query.businessId as string);
    res.json({ status: 'success', data: summary });
  } catch (error) { next(error); }
});

router.patch('/innovation', validate(innovationUpdateSchema), async (req, res, next) => {
  try {
    const record = await InnovationService.updateResult(req.body.id, req.body);
    res.json({ status: 'success', data: record });
  } catch (error) { next(error); }
});

// ── 12.8 Governance Routes ──

router.post('/governance/policy', validate(policySchema), async (req, res, next) => {
  try {
    const policy = await GovernanceService.upsertPolicy(req.body.businessId, req.body);
    res.json({ status: 'success', data: policy });
  } catch (error) { next(error); }
});

router.get('/governance/policies', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as any;
    const policies = await GovernanceService.getPolicies(q.businessId, {
      domain: q.domain, status: q.status,
    });
    res.json({ status: 'success', data: policies });
  } catch (error) { next(error); }
});

router.get('/governance/audit', validate(businessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const audit = await GovernanceService.runAudit(req.query.businessId as string);
    res.json({ status: 'success', data: audit });
  } catch (error) { next(error); }
});

router.post('/governance/agent-eval', validate(agentEvalSchema), async (req, res, next) => {
  try {
    const result = await GovernanceService.evaluateAgentRequest(req.body.businessId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) { next(error); }
});

export const maturityRouter = router;
