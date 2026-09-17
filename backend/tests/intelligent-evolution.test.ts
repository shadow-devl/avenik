import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/index.js';
import { PrismaClient } from '@prisma/client';
import app from '../src/server.js';

const prisma = new PrismaClient();
let userId: string;
let businessId: string;
let orgId: string;
let token: string;

describe('Global Intelligent Entrepreneurial Platform Evolution', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { name: 'Phase13 Tester', email: `phase13-${Date.now()}@test.com`, status: 'ACTIVE' },
    });
    userId = user.id;
    token = jwt.sign({ userId, email: user.email, roles: ['ENTREPRENEUR'] }, config.jwtSecret);

    const org = await prisma.organization.create({
      data: { name: 'Phase13 Test Org', status: 'ACTIVE' },
    });
    orgId = org.id;

    const business = await prisma.business.create({
      data: { displayName: 'Phase13 Test Business', ownerUserId: userId, organizationId: orgId },
    });
    businessId = business.id;
  });

  afterAll(async () => {
    await prisma.competitiveIntel.deleteMany({ where: { businessId } });
    await prisma.strategicSimulation.deleteMany({ where: { businessId } });
    await prisma.agentTask.deleteMany({ where: { businessId } });
    await prisma.intelligenceSignal.deleteMany({ where: { businessId } });
    await prisma.business.deleteMany({ where: { id: businessId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  // ── 13.1 Intelligence Signal Fabric ──

  it('13.1 Creates and prioritizes intelligence signals', async () => {
    // Create signals across domains
    await request(app).post('/api/evolution/signals')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, domain: 'FINANCE', signalType: 'DETERIORATION',
      title: 'Cash burn increasing', impact: 'HIGH', urgency: 'HIGH', confidence: 0.85,
    });

    await request(app).post('/api/evolution/signals')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, domain: 'MARKET', signalType: 'OPPORTUNITY',
      title: 'New market segment emerging', impact: 'MEDIUM', urgency: 'LOW', confidence: 0.6,
    });

    await request(app).post('/api/evolution/signals')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, domain: 'OPERATIONS', signalType: 'BOTTLENECK',
      title: 'Delivery pipeline saturated', impact: 'CRITICAL', urgency: 'IMMEDIATE', confidence: 0.95,
    });

    const res = await request(app).get(`/api/evolution/signals?businessId=${businessId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    // CRITICAL/IMMEDIATE should be first
    expect(res.body.data[0].impact).toBe('CRITICAL');
    expect(res.body.data[0].priorityScore).toBeGreaterThan(res.body.data[1].priorityScore);
  });

  it('13.1 Gets aggregated business state from signals', async () => {
    const res = await request(app).get(`/api/evolution/signals/state?businessId=${businessId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalSignals).toBe(3);
    expect(res.body.data.criticalSignals).toBe(1);
    expect(res.body.data.opportunities).toBe(1);
    expect(res.body.data.risks).toBe(1); // DETERIORATION counts as risk
    expect(res.body.data.byDomain.FINANCE).toBeDefined();
    expect(res.body.data.byDomain.OPERATIONS).toBeDefined();
  });

  // ── 13.2 Agent Workforce ──

  it('13.2 Creates, approves, and executes agent tasks with safety controls', async () => {
    // Create a high-autonomy task (should auto-set to AWAITING_APPROVAL)
    const createRes = await request(app).post('/api/evolution/agents/tasks')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, userId, agentType: 'FINANCE', purpose: 'Analyze cash flow trends',
      autonomyLevel: 5, tools: ['query_financials', 'generate_report'], riskLevel: 'MEDIUM',
    });

    expect(createRes.status).toBe(200);
    expect(createRes.body.data.status).toBe('AWAITING_APPROVAL');
    expect(createRes.body.data.autonomyLevel).toBe(5);

    const taskId = createRes.body.data.id;

    // Approve
    const approveRes = await request(app).post('/api/evolution/agents/tasks/approve')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId, approvedBy: 'admin@avenik.com' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');
    expect(approveRes.body.data.approvedBy).toBe('admin@avenik.com');

    // Execute
    const execRes = await request(app).post('/api/evolution/agents/tasks/execute')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId });

    expect(execRes.status).toBe(200);
    expect(execRes.body.data.status).toBe('COMPLETED');
    expect(execRes.body.data.result).toBeDefined();
    expect(execRes.body.data.rollbackInfo).toBeDefined();
  });

  it('13.2 Can cancel agent tasks', async () => {
    const createRes = await request(app).post('/api/evolution/agents/tasks')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, userId, agentType: 'RESEARCH', purpose: 'Scan patent databases',
      autonomyLevel: 2, riskLevel: 'LOW',
    });
    const taskId = createRes.body.data.id;

    const cancelRes = await request(app).post('/api/evolution/agents/tasks/cancel')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');
  });

  // ── 13.3 Strategic Simulation ──

  it('13.3 Creates and runs strategic simulations with projections', async () => {
    const createRes = await request(app).post('/api/evolution/simulations')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, title: 'Aggressive Expansion',
      scenarioType: 'UPSIDE', variables: { revenue: 200000, growthRate: 0.15, costRatio: 0.55 },
      assumptions: ['Market share doubles', 'Team grows 3x'],
    });

    expect(createRes.status).toBe(200);
    expect(createRes.body.data.scenarioType).toBe('UPSIDE');
    expect(createRes.body.data.status).toBe('DRAFT');

    const simId = createRes.body.data.id;

    // Run it
    const runRes = await request(app).post('/api/evolution/simulations/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: simId });

    expect(runRes.status).toBe(200);
    expect(runRes.body.data.status).toBe('COMPLETED');
    expect(runRes.body.data.projections).toBeDefined();
    expect(runRes.body.data.projections.revenue.length).toBe(4);
    expect(runRes.body.data.tradeOffs.length).toBeGreaterThan(0);
  });

  // ── 13.4 Competitive Intelligence ──

  it('13.4 Tracks competitive intelligence with landscape summary', async () => {
    await request(app).post('/api/evolution/competitive')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, competitorName: 'CompetitorA', domain: 'PRICING',
      insight: 'Reduced pricing by 15% for enterprise tier', confidence: 0.8,
      impactOnBusiness: 'May lose price-sensitive enterprise customers',
    });

    await request(app).post('/api/evolution/competitive')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, competitorName: 'CompetitorA', domain: 'PRODUCT',
      insight: 'Launched AI-powered analytics dashboard', confidence: 0.9,
    });

    await request(app).post('/api/evolution/competitive')
      .set('Authorization', `Bearer ${token}`).send({
      businessId, competitorName: 'CompetitorB', domain: 'MARKET_SHARE',
      insight: 'Expanding into Southeast Asian markets', confidence: 0.7,
    });

    const summaryRes = await request(app).get(`/api/evolution/competitive/summary?businessId=${businessId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.totalEntries).toBe(3);
    expect(summaryRes.body.data.competitorCount).toBe(2);
    expect(summaryRes.body.data.byCompetitor.CompetitorA.count).toBe(2);
    expect(summaryRes.body.data.byCompetitor.CompetitorA.domains).toContain('PRICING');
    expect(summaryRes.body.data.byCompetitor.CompetitorA.domains).toContain('PRODUCT');
  });
});
