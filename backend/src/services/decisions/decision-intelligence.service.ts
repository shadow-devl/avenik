import { prisma } from '../../db.js';

export class DecisionIntelligenceService {
  static async getDecisionMetrics(businessId: string) {
    const decisions = await prisma.decision.findMany({
      where: { businessId },
      include: { recommendation: true },
      orderBy: { updatedAt: 'desc' }
    });

    const recommendations = await prisma.recommendation.findMany({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { confidence: 'desc' }
    });

    let pending = 0;
    let decided = 0;
    let executed = 0;

    decisions.forEach(d => {
      if (d.status === 'PENDING') pending++;
      if (d.status === 'DECIDED') decided++;
      if (d.status === 'EXECUTED') executed++;
    });

    const aiDriven = decisions.filter(d => d.recommendationId != null).length;
    const aiAdoptionRate = decisions.length > 0 ? Math.round((aiDriven / decisions.length) * 100) : 0;

    return {
      overview: {
        totalDecisions: decisions.length,
        pendingDecisions: pending,
        executedDecisions: executed,
        aiAdoptionRate
      },
      activeRecommendations: recommendations.slice(0, 5).map(r => ({
        id: r.id,
        domain: r.domain,
        title: r.title,
        confidence: r.confidence,
        impact: r.impact,
        source: r.sourceAiModel || 'AVENIK_CORE'
      })),
      recentDecisions: decisions.slice(0, 10).map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        rationale: d.rationale,
        aiAssisted: !!d.recommendationId,
        updatedAt: d.updatedAt
      }))
    };
  }
}
