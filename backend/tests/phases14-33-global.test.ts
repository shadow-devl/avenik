import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/server.js';

const prisma = new PrismaClient();
let userId: string;
let businessId: string;
let orgId: string;

describe('Phases 14-33: Global Ecosystem & Intelligence Platform', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { name: 'Scale Tester', email: `scale-${Date.now()}@test.com`, status: 'ACTIVE' },
    });
    userId = user.id;

    const org = await prisma.organization.create({
      data: { name: 'Scale Test Org', status: 'ACTIVE' },
    });
    orgId = org.id;

    const business = await prisma.business.create({
      data: { displayName: 'Scale Test Business', ownerUserId: userId, organizationId: orgId },
    });
    businessId = business.id;
  });

  afterAll(async () => {
    await prisma.economicEngine.deleteMany({ where: { businessId } });
    await prisma.platformIntelligenceNode.deleteMany({ where: { businessId } });
    await prisma.globalEcosystemNetwork.deleteMany({ where: { businessId } });
    await prisma.business.deleteMany({ where: { id: businessId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('Registers Global Ecosystem Networks (Phases 14-33 concept)', async () => {
    const res = await request(app).post('/api/global/network').send({
      businessId, networkType: 'SUPPLY_CHAIN_HUB', region: 'APAC'
    });
    expect(res.status).toBe(200);
    expect(res.body.data.networkType).toBe('SUPPLY_CHAIN_HUB');
  });

  it('Deploys Intelligence Nodes (Phases 14-33 concept)', async () => {
    const res = await request(app).post('/api/global/nodes').send({
      businessId, nodeRole: 'SUPPLY_CHAIN_OPTIMIZER', autonomyLevel: 4
    });
    expect(res.status).toBe(200);
    expect(res.body.data.nodeRole).toBe('SUPPLY_CHAIN_OPTIMIZER');
    expect(res.body.data.autonomyLevel).toBe(4);
  });

  it('Runs Economic Simulations (Phases 14-33 concept)', async () => {
    const res = await request(app).post('/api/global/economics/simulate').send({
      businessId, scenarioName: 'High Inflation Shock', macroFactors: { inflation: 0.08, interestRate: 0.07 }
    });
    expect(res.status).toBe(200);
    expect(res.body.data.scenarioName).toBe('High Inflation Shock');
    expect(res.body.data.riskExposure).toBe(0.8);
  });
});
