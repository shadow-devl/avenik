import { prisma } from '../../db.js';

export class OperationsIntelligenceService {
  static async getMetrics(businessId: string) {
    const capacities = await prisma.workforceCapacity.findMany({
      where: { businessId }
    });

    const actions = await prisma.action.findMany({
      where: { 
        businessId,
        status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] }
      }
    });

    const signals = await prisma.intelligenceSignal.findMany({
      where: {
        businessId,
        domain: 'OPERATIONS'
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalCapacity = 0;
    let utilizedCapacity = 0;

    capacities.forEach(c => {
      totalCapacity += c.requiredFTE;
      utilizedCapacity += c.currentFTE;
    });

    const utilizationRate = totalCapacity > 0 ? Math.round((utilizedCapacity / totalCapacity) * 100) : 0;
    const blockedActions = actions.filter(a => a.status === 'BLOCKED').length;

    return {
      overview: {
        utilizationRate,
        pendingOperations: actions.length,
        blockedOperations: blockedActions,
        operationalAlerts: signals.length
      },
      workforceStatus: capacities.map(c => ({
        id: c.id,
        role: c.roleName,
        utilization: c.requiredFTE > 0 ? Math.round((c.currentFTE / c.requiredFTE) * 100) : 0
      })),
      activeAlerts: signals.slice(0, 5).map(s => ({
        id: s.id,
        type: s.signalType,
        title: s.title,
        impact: s.impact,
        urgency: s.urgency
      })),
      bottlenecks: actions.filter(a => a.status === 'BLOCKED').map(a => ({
        id: a.id,
        title: a.title,
        priority: a.priority
      }))
    };
  }
}
