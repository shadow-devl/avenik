import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/server.js';

const prisma = new PrismaClient();
let userId: string;
let businessId: string;
let orgId: string;

describe('Phase 12: Global Intelligent Entrepreneurial Platform Maturity', () => {
  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Phase12 Tester',
        email: `phase12-${Date.now()}@test.com`,
        status: 'ACTIVE',
      },
    });
    userId = user.id;

    // Create test org
    const org = await prisma.organization.create({
      data: {
        name: 'Phase12 Test Org',
        status: 'ACTIVE',
      },
    });
    orgId = org.id;

    // Create test business with financial data
    const business = await prisma.business.create({
      data: {
        displayName: 'Phase12 Test Business',
        ownerUserId: userId,
        organizationId: orgId,
        financialRecords: {
          createMany: {
            data: [
              { type: 'INFLOW', category: 'REVENUE', amount: 10000, transactionDate: new Date('2026-01-01'), description: 'Jan revenue' },
              { type: 'INFLOW', category: 'REVENUE', amount: 10500, transactionDate: new Date('2026-02-01'), description: 'Feb revenue' },
              { type: 'INFLOW', category: 'REVENUE', amount: 11000, transactionDate: new Date('2026-03-01'), description: 'Mar revenue' },
              { type: 'INFLOW', category: 'REVENUE', amount: 10200, transactionDate: new Date('2026-04-01'), description: 'Apr revenue' },
              { type: 'INFLOW', category: 'REVENUE', amount: 25000, transactionDate: new Date('2026-05-01'), description: 'May revenue spike' },
              { type: 'OUTFLOW', category: 'EXPENSE', amount: 5000, transactionDate: new Date('2026-01-01'), description: 'Jan expense' },
              { type: 'OUTFLOW', category: 'EXPENSE', amount: 5200, transactionDate: new Date('2026-02-01'), description: 'Feb expense' },
              { type: 'OUTFLOW', category: 'EXPENSE', amount: 5100, transactionDate: new Date('2026-03-01'), description: 'Mar expense' },
              { type: 'OUTFLOW', category: 'EXPENSE', amount: 5300, transactionDate: new Date('2026-04-01'), description: 'Apr expense' },
              { type: 'OUTFLOW', category: 'EXPENSE', amount: 5150, transactionDate: new Date('2026-05-01'), description: 'May expense' },
            ],
          },
        },
        goals: {
          create: {
            title: 'Scale Revenue',
            description: 'Grow revenue 2x',
            category: 'FINANCIAL',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            ownerUserId: userId,
          },
        },
      },
    });
    businessId = business.id;
  });

  afterAll(async () => {
    // Cleanup in reverse dependency order
    await prisma.governancePolicy.deleteMany({ where: { businessId } });
    await prisma.innovationRecord.deleteMany({ where: { businessId } });
    await prisma.anomalyDetection.deleteMany({ where: { businessId } });
    await prisma.entrepreneurDigitalTwin.deleteMany({ where: { businessId } });
    await prisma.goal.deleteMany({ where: { businessId } });
    await prisma.financialRecord.deleteMany({ where: { businessId } });
    await prisma.business.deleteMany({ where: { id: businessId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  // ── 12.1 Digital Twin ──

  it('12.1 Syncs and retrieves entrepreneur digital twin', async () => {
    const syncRes = await request(app)
      .post('/api/maturity/digital-twin/sync')
      .send({ userId, businessId });

    expect(syncRes.status).toBe(200);
    expect(syncRes.body.data.userId).toBe(userId);
    expect(syncRes.body.data.businessId).toBe(businessId);
    expect(syncRes.body.data.goals).toBeDefined();
    expect(syncRes.body.data.activeWorkContext).toBeDefined();

    const getRes = await request(app)
      .get(`/api/maturity/digital-twin?userId=${userId}&businessId=${businessId}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(syncRes.body.data.id);
  });

  it('12.1 Updates entrepreneur preferences', async () => {
    const res = await request(app)
      .put('/api/maturity/digital-twin/preferences')
      .send({ userId, businessId, preferences: { theme: 'dark', language: 'en' } });

    expect(res.status).toBe(200);
    expect(res.body.data.preferences).toEqual({ theme: 'dark', language: 'en' });
  });

  // ── 12.2 Anomaly Detection ──

  it('12.2 Detects financial anomalies with prescriptions', async () => {
    const res = await request(app)
      .post(`/api/maturity/anomalies/detect?businessId=${businessId}`)
      .send();

    expect(res.status).toBe(200);
    // Should detect the revenue spike (25000 vs ~10000 avg)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const anomaly = res.body.data.find((a: any) => a.domain === 'REVENUE');
    expect(anomaly).toBeDefined();
    expect(anomaly.deviationPct).toBeGreaterThan(30);
    expect(anomaly.prescription).toBeDefined();
    expect(anomaly.prescription.options.length).toBeGreaterThan(0);
  });

  it('12.2 Updates anomaly status to INVESTIGATING', async () => {
    const anomalies = await request(app)
      .get(`/api/maturity/anomalies?businessId=${businessId}`);

    const anomalyId = anomalies.body.data[0].id;
    const res = await request(app)
      .patch('/api/maturity/anomalies')
      .send({ id: anomalyId, status: 'INVESTIGATING', rootCause: 'New enterprise deal' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INVESTIGATING');
    expect(res.body.data.rootCause).toBe('New enterprise deal');
  });

  // ── 12.7 Innovation ──

  it('12.7 Creates and tracks innovation records', async () => {
    const createRes = await request(app)
      .post('/api/maturity/innovation')
      .send({
        businessId,
        type: 'EXPERIMENT',
        title: 'A/B Test Pricing',
        description: 'Test 20% price increase on premium tier',
        hypothesis: 'Revenue per user will increase without significant churn',
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.data.type).toBe('EXPERIMENT');
    expect(createRes.body.data.status).toBe('DRAFT');

    // Create an IP record too
    await request(app)
      .post('/api/maturity/innovation')
      .send({
        businessId,
        type: 'PATENT',
        title: 'AI Matching Algorithm',
        description: 'Novel approach to opportunity matching',
      });

    const summaryRes = await request(app)
      .get(`/api/maturity/innovation/summary?businessId=${businessId}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.total).toBe(2);
    expect(summaryRes.body.data.byType.EXPERIMENT).toBe(1);
    expect(summaryRes.body.data.byType.PATENT).toBe(1);
  });

  // ── 12.8 Governance ──

  it('12.8 Creates governance policies and runs audit', async () => {
    // Create policies
    await request(app)
      .post('/api/maturity/governance/policy')
      .send({
        businessId, domain: 'AI', policyName: 'AI Output Review',
        description: 'All AI-generated outputs must be human-reviewed before becoming authoritative',
        controlType: 'HYBRID', owner: 'CTO', evidenceRequired: true,
        riskLevel: 'HIGH', mitigations: ['Human review gate', 'Output classification'],
      });

    await request(app)
      .post('/api/maturity/governance/policy')
      .send({
        businessId, domain: 'SECURITY', policyName: 'Tenant Isolation',
        description: 'All data access must be scoped to the authenticated tenant',
        controlType: 'AUTOMATED', riskLevel: 'CRITICAL',
        mitigations: ['Row-level security', 'Query scoping middleware'],
      });

    // Run audit
    const auditRes = await request(app)
      .get(`/api/maturity/governance/audit?businessId=${businessId}`);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.data.totalPolicies).toBe(2);
    expect(auditRes.body.data.governanceScore).toBeGreaterThan(0);
    expect(auditRes.body.data.missingDomains).toContain('RISK');
    expect(auditRes.body.data.missingDomains).toContain('PRIVACY');
  });

  it('12.8 Evaluates agent governance constraints', async () => {
    const res = await request(app)
      .post('/api/maturity/governance/agent-eval')
      .send({
        businessId,
        agentName: 'financial-agent',
        tool: 'transfer_funds',
        domain: 'FINANCIAL',
        riskLevel: 'HIGH',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.requiresApproval).toBe(true);
    expect(res.body.data.reason).toBeDefined();
  });
});
