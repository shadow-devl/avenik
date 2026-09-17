import { prisma } from '../../db.js';

export class GenericIntelligenceService {
  static async getMetrics(businessId: string, domain: string) {
    // Map domain string to intelligence signals domain if possible
    let mappedDomain = 'OPERATIONS';
    if (domain.includes('customer') || domain.includes('market')) mappedDomain = 'CUSTOMER';
    else if (domain.includes('finance') || domain.includes('revenue')) mappedDomain = 'FINANCE';
    else if (domain.includes('ecosystem') || domain.includes('collaboration')) mappedDomain = 'ECOSYSTEM';
    else if (domain.includes('govern') || domain.includes('trust')) mappedDomain = 'RISK';

    const signals = await prisma.intelligenceSignal.findMany({
      where: { businessId, domain: mappedDomain },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const actions = await prisma.action.findMany({
      where: { businessId, status: { notIn: ['DONE', 'CANCELLED'] } },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    const goals = await prisma.goal.count({
      where: { businessId, status: 'ACTIVE' }
    });

    const health = await prisma.businessHealth.findFirst({
      where: { businessId },
      orderBy: { calculatedAt: 'desc' }
    });

    return {
      domain,
      overview: {
        healthScore: health?.score || 85,
        activeSignals: signals.length,
        pendingActions: await prisma.action.count({ where: { businessId, status: { notIn: ['DONE', 'CANCELLED'] } } }),
        associatedGoals: goals
      },
      recentSignals: signals.map(s => ({
        id: s.id,
        title: s.title,
        type: s.signalType,
        impact: s.impact
      })),
      recentActions: actions.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        priority: a.priority
      }))
    };
  }
}
