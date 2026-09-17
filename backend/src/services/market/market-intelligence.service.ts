import { prisma } from '../../db.js';

export class MarketIntelligenceService {
  static async getMarketMetrics(businessId: string) {
    const intel = await prisma.competitiveIntel.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const plans = await prisma.commercialExpansionPlan.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const marketShareThreats = intel.filter(i => i.domain === 'MARKET_SHARE' && i.confidence > 0.7).length;
    const expansionOpportunities = plans.filter(p => p.status === 'DRAFT' || p.status === 'EVALUATING').length;

    let marketPosition = 50 + (expansionOpportunities * 10) - (marketShareThreats * 15);
    marketPosition = Math.max(0, Math.min(100, marketPosition));

    return {
      marketPositionScore: marketPosition,
      activeCompetitors: [...new Set(intel.map(i => i.competitorName))],
      insights: intel.map(i => ({
        id: i.id,
        competitor: i.competitorName,
        domain: i.domain,
        insight: i.insight,
        confidence: i.confidence,
        date: i.createdAt
      })),
      expansionPlans: plans.map(p => ({
        id: p.id,
        market: p.targetMarket,
        status: p.status,
        investment: p.investmentNeeded
      }))
    };
  }
}
