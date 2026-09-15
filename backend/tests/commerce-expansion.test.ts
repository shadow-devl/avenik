import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/db.js';
import { CommerceService } from '../src/services/commerce/commerce.service.js';

describe('Phase 10.5 Global Commerce & Expansion Intelligence', () => {
  let user: any;
  let business: any;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: { name: 'Commerce Admin', email: `commerce_${Date.now()}@test.com`, status: 'ACTIVE' }
    });
    business = await prisma.business.create({
      data: { ownerUser: { connect: { id: user.id } }, displayName: 'ExpandCorp', countryCode: 'IN', businessStatus: 'ACTIVE' }
    });

    // Seed some financial records (liquid)
    await prisma.financialRecord.createMany({
      data: [
        { businessId: business.id, type: 'INFLOW', category: 'REVENUE', amount: 200000, transactionDate: new Date() },
        { businessId: business.id, type: 'OUTFLOW', category: 'EXPENSE', amount: 50000, transactionDate: new Date() }
      ]
    });

    // Seed health record
    await prisma.businessHealth.create({
      data: {
        businessId: business.id,
        score: 85, dimension: 'OVERALL', trend: 'STABLE',
        calculatedAt: new Date()
      }
    });

    // Seed some connections
    const targetBusiness = await prisma.business.create({
      data: { ownerUser: { connect: { id: user.id } }, displayName: 'TargetCorp' }
    });
    
    await prisma.ecosystemRelationship.create({
      data: {
        sourceBusinessId: business.id,
        targetBusinessId: targetBusiness.id,
        status: 'CONSENTED',
        relationshipType: 'PARTNER'
      }
    });
  });

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { ownerUserId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('Evaluates expansion viability correctly', async () => {
    const result = await CommerceService.evaluateExpansionViability(business.id, 'EU_MARKET');
    
    expect(result.netCash).toBe(150000);
    // Net cash > 50k = 30 pts
    // Health 85 = (85/100)*40 = 34 pts
    // Network (1) = 5 pts
    // Total roughly 69
    expect(result.viabilityScore).toBeGreaterThan(60);
    expect(result.recommendation).toContain('Strong profile');
    expect(result.planId).toBeDefined();

    const dbPlan = await prisma.commercialExpansionPlan.findUnique({
      where: { id: result.planId }
    });
    expect(dbPlan).not.toBeNull();
    expect(dbPlan?.status).toBe('APPROVED');
  });
});
