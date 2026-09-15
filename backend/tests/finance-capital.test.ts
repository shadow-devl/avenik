import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/db.js';
import { CapitalService } from '../src/services/finance/capital.service.js';
import { ScenarioService } from '../src/services/finance/scenario.service.js';
import { ContextService } from '../src/services/context.service.js';

describe('Phase 10.4 Global Finance & Capital Intelligence', () => {
  let user: any;
  let business: any;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: { name: 'Finance Admin', email: `finance_${Date.now()}@test.com`, status: 'ACTIVE' }
    });
    business = await prisma.business.create({
      data: { ownerUser: { connect: { id: user.id } }, displayName: 'FinCorp', countryCode: 'IN', businessStatus: 'ACTIVE', registrationNumber: 'CIN123' }
    });

    // Seed some financial records
    await prisma.financialRecord.createMany({
      data: [
        { businessId: business.id, type: 'INFLOW', category: 'REVENUE', amount: 50000, transactionDate: new Date() },
        { businessId: business.id, type: 'OUTFLOW', category: 'EXPENSE', amount: 30000, transactionDate: new Date() }
      ]
    });

    // Seed a funding request
    await prisma.fundingRequest.create({
      data: {
        businessId: business.id,
        amount: 100000,
        purpose: 'Expansion',
        status: 'DRAFT'
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.business.delete({ where: { id: business.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('Calculates Capital Gap correctly', async () => {
    const { availableCapital, capitalRequired, capitalGap } = await CapitalService.calculateCapitalGap(business.id);
    
    // Inflows (50k) - Outflows (30k) = 20k available
    expect(availableCapital).toBe(20000);
    // Request amount = 100k
    expect(capitalRequired).toBe(100000);
    // Gap = 100k - 20k = 80k
    expect(capitalGap).toBe(80000);
  });

  it('Assesses financial readiness properly', async () => {
    const readiness = await CapitalService.assessReadiness(business.id);
    
    // ACTIVE business (25), has financial history (25), registered (25), no goal set yet (0)
    expect(readiness.checks.identityVerified).toBe(true);
    expect(readiness.checks.hasFinancialHistory).toBe(true);
    expect(readiness.checks.isRegistered).toBe(true);
    expect(readiness.checks.hasClearGoal).toBe(false);
    expect(readiness.readinessScore).toBe(75);
    expect(readiness.status).toBe('NEEDS_WORK');
  });

  it('Calculates deterministic Debt EMI scenario', () => {
    const scenario = ScenarioService.calculateDebtScenario(100000, 12, 12); // 1 Lakh, 12% annual, 12 months
    
    expect(scenario.monthlyEMI).toBeGreaterThan(8800); // Rough expectation: ~8884
    expect(scenario.monthlyEMI).toBeLessThan(8900);
    expect(scenario.totalPayment).toBeGreaterThan(100000);
    expect(scenario.totalInterest).toBeGreaterThan(0);
  });

  it('Calculates deterministic Equity dilution scenario', () => {
    const scenario = ScenarioService.calculateEquityScenario(1000000, 250000, 100); // 1M valuation, 250k investment, 100% ownership
    
    expect(scenario.postMoneyValuation).toBe(1250000);
    expect(scenario.newInvestorOwnershipPct).toBe(20); // 250k / 1.25M = 20%
    expect(scenario.newFounderOwnershipPct).toBe(80);
  });
});
