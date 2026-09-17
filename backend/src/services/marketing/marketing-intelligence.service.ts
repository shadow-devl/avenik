import { prisma } from '../../db.js';

export class MarketingIntelligenceService {
  static async getMetrics(businessId: string) {
    const plans = await prisma.commercialExpansionPlan.findMany({
      where: { businessId },
      include: { segments: true }
    });

    const segments = plans.flatMap(p => p.segments);
    
    let totalTargetAudience = 0;
    let highReadinessCount = 0;

    segments.forEach(s => {
      totalTargetAudience += (s.size || 0);
      if (s.readiness === 'HIGH') highReadinessCount += (s.size || 0);
    });

    const expansionHealth = plans.length > 0 ? 
      Math.round(plans.reduce((sum, p) => sum + (p.viabilityScore || 0), 0) / plans.length * 100) : 0;

    const marketPenetration = totalTargetAudience > 0 ? 
      Math.round((highReadinessCount / totalTargetAudience) * 100) : 0;

    return {
      overview: {
        totalTargetAudience,
        highReadinessCount,
        marketPenetration,
        expansionHealth,
        activeCampaigns: plans.filter(p => p.status === 'EXECUTING').length
      },
      expansionPlans: plans.map(p => ({
        id: p.id,
        market: p.targetMarket,
        status: p.status,
        viability: p.viabilityScore,
        investment: p.investmentNeeded,
        segmentsCount: p.segments.length
      })),
      topSegments: segments
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          name: s.name,
          size: s.size,
          readiness: s.readiness
        }))
    };
  }
}
