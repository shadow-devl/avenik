import { prisma } from '../../db.js';

export class OperationsIntelligenceService {
  static async getMetrics(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({
      where: { businessId, mitigated: false },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const pendingActions = await prisma.businessAction.findMany({
      where: { businessId, status: { not: 'COMPLETED' } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const criticalRisksCount = risks.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH').length;

    let systemHealth = 100 - (criticalRisksCount * 10) - (pendingActions.length * 2);
    if (systemHealth < 0) systemHealth = 0;

    return {
      systemHealth,
      activeRisks: risks.map(r => ({
        id: r.id,
        area: r.riskArea,
        severity: r.severity,
        date: r.createdAt
      })),
      bottlenecks: pendingActions.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status
      }))
    };
  }
}
