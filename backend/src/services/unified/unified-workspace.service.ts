import { prisma } from '../../db.js';

export class UnifiedWorkspaceService {
  static async getExecutiveOverview(businessId: string) {
    // 1. Health & Trust
    const health = await prisma.businessHealth.findFirst({
      where: { businessId },
      orderBy: { calculatedAt: 'desc' }
    });
    
    const trust = await prisma.trustProfile.findFirst({
      where: { businessId }
    });

    // 2. Financial Overview
    const financials = await prisma.financialRecord.findMany({
      where: { businessId },
      orderBy: { transactionDate: 'desc' },
      take: 1
    });

    // 3. Execution (Goals & Actions)
    const activeGoals = await prisma.goal.count({
      where: { businessId, status: { in: ['ACTIVE', 'ON_TRACK', 'AT_RISK'] } }
    });
    
    const pendingActions = await prisma.action.count({
      where: { businessId, status: { notIn: ['DONE', 'CANCELLED'] } }
    });

    // 4. Ecosystem & Market
    const connections = await prisma.ecosystemRelationship.count({
      where: {
        OR: [{ sourceBusinessId: businessId }, { targetBusinessId: businessId }],
        status: { in: ['ACTIVE', 'CONSENTED'] }
      }
    });

    // 5. Active AI Decisions
    const pendingDecisions = await prisma.decision.count({
      where: { businessId, status: 'PENDING' }
    });

    return {
      coreMetrics: {
        overallHealth: health?.score || 85,
        trustScore: trust?.trustScore || 80,
        runwayMonths: 12, // Mock runway
        activeConnections: connections
      },
      execution: {
        activeGoals,
        pendingActions,
        pendingDecisions
      },
      signals: await prisma.intelligenceSignal.findMany({
        where: { businessId },
        orderBy: { confidence: 'desc' },
        take: 5
      }),
      recentActivity: await prisma.action.findMany({
        where: { businessId, status: 'DONE' },
        orderBy: { completedAt: 'desc' },
        take: 5
      })
    };
  }
}
