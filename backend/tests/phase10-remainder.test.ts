import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/db.js';
import { WorkforceService } from '../src/services/workforce/workforce.service.js';
import { OperationsService } from '../src/services/operations/operations.service.js';
import { StrategyService } from '../src/services/strategy/strategy.service.js';
import { CommandService } from '../src/services/command/command.service.js';

describe('Phase 10 Remainder (10.6 - 10.9)', () => {
  let user: any;
  let business: any;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: { name: 'Phase 10 Admin', email: `phase10_${Date.now()}@test.com`, status: 'ACTIVE' }
    });
    business = await prisma.business.create({
      data: { ownerUser: { connect: { id: user.id } }, displayName: 'Phase10Corp', countryCode: 'IN', businessStatus: 'ACTIVE' }
    });
  });

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { ownerUserId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('10.6: Assesses workforce capacity', async () => {
    const res = await WorkforceService.assessCapacity(business.id, 'Engineer', 2, 5);
    expect(res.capacity.overloaded).toBe(true);
    expect(res.recommendation).toContain('understaffed');
  });

  it('10.7: Evaluates operational risk', async () => {
    const res = await OperationsService.evaluateRisk(business.id, 'Supply Chain', 'CRITICAL');
    expect(res.risk.severity).toBe('CRITICAL');
    expect(res.mitigation).toContain('Immediate action');
  });

  it('10.8: Generates growth scenario', async () => {
    const res = await StrategyService.generateGrowthScenario(business.id, 'US Expansion', 2000000, 0.6);
    expect(res.expectedValue).toBe(1200000);
    expect(res.insight).toContain('High impact scenario');
  });

  it('10.9: Generates unified command summary', async () => {
    const res = await CommandService.generateUnifiedSummary(business.id);
    expect(res.name).toBe('Phase10Corp');
    expect(res.workforce.overloadedRoles).toBe(1);
    expect(res.operations.criticalRisks).toBe(1);
    expect(res.strategy.scenarios).toBe(1);
    expect(res.actionItems).toContain('URGENT');
  });
});
