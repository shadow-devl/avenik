import { prisma } from '../../db.js';

export class DecisionIntelligenceService {
  static async getMetrics(businessId: string) {
    const decisions = await prisma.decision.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { recommendation: true }
    });

    const recommendations = await prisma.recommendation.findMany({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { confidenceScore: 'desc' }
    });

    const pendingDecisions = decisions.filter(d => d.status === 'PENDING').length;
    const automatedActions = decisions.filter(d => d.status === 'EXECUTED').length;

    let totalConfidence = 0;
    recommendations.forEach(r => totalConfidence += r.confidenceScore);
    const avgConfidence = recommendations.length > 0 ? Math.round((totalConfidence / recommendations.length) * 100) : 0;

    return {
      overview: {
        pendingDecisions,
        automatedActions,
        activeRecommendations: recommendations.length,
        averageConfidence: avgConfidence
      },
      topRecommendations: recommendations.slice(0, 5).map(r => ({
        id: r.id,
        domain: r.category,
        title: r.title,
        confidence: r.confidenceScore,
        impact: r.impactScore,
        createdAt: r.createdAt
      })),
      recentDecisions: decisions.slice(0, 10).map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        outcome: d.outcome,
        createdAt: d.createdAt
      }))
    };
  }
}
