import { prisma } from '../../db.js';

export class CommerceService {
  /**
   * Evaluates the viability of expanding to a target market.
   * Pulls in existing Business Health and Financial Records to score readiness.
   */
  static async evaluateExpansionViability(businessId: string, targetMarket: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        healthRecords: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        financialRecords: true,
        sourceRelationships: true
      }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    let viabilityScore = 0;
    
    // 1. Health Base Score (max 40 points)
    const latestHealth = business.healthRecords[0];
    if (latestHealth) {
      viabilityScore += (latestHealth.score / 100) * 40;
    }

    // 2. Financial Readiness (max 30 points)
    // Needs positive cash flow to expand
    const inflows = business.financialRecords.filter(r => r.type === 'INFLOW').reduce((sum, r) => sum + r.amount, 0);
    const outflows = business.financialRecords.filter(r => r.type === 'OUTFLOW').reduce((sum, r) => sum + r.amount, 0);
    const netCash = inflows - outflows;

    if (netCash > 50000) {
      viabilityScore += 30; // Highly liquid
    } else if (netCash > 10000) {
      viabilityScore += 15;
    } else {
      viabilityScore += 5;
    }

    // 3. Network & Ecosystem Strength (max 30 points)
    // Strong network helps in expansion
    const relationships = business.sourceRelationships.length;
    if (relationships > 5) viabilityScore += 30;
    else if (relationships > 2) viabilityScore += 15;
    else viabilityScore += 5;

    // Create the plan
    const plan = await prisma.commercialExpansionPlan.create({
      data: {
        businessId,
        targetMarket,
        status: viabilityScore > 60 ? 'APPROVED' : 'EVALUATING',
        viabilityScore: Math.round(viabilityScore * 100) / 100
      }
    });

    return {
      planId: plan.id,
      targetMarket,
      viabilityScore: Math.round(viabilityScore * 100) / 100,
      netCash,
      networkSize: relationships,
      recommendation: viabilityScore > 60 
        ? `Strong profile for expanding into ${targetMarket}.` 
        : `Improve cash flow or network before expanding to ${targetMarket}.`
    };
  }
}
