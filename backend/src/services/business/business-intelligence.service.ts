import { prisma } from '../../db.js';

export class BusinessIntelligenceService {
  static async getMetrics(businessId: string) {
    const goals = await prisma.goal.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const metrics = await prisma.goalMetric.findMany({
      where: { goal: { businessId } }
    });

    const health = await prisma.businessHealth.findFirst({
      where: { businessId },
      orderBy: { calculatedAt: 'desc' }
    });

    let onTrack = 0;
    let atRisk = 0;
    let completed = 0;

    goals.forEach(g => {
      if (g.status === 'ON_TRACK') onTrack++;
      if (g.status === 'AT_RISK') atRisk++;
      if (g.status === 'COMPLETED') completed++;
    });

    const progressRate = goals.length > 0 ? 
      Math.round(((completed + (onTrack * 0.5)) / goals.length) * 100) : 0;

    return {
      overview: {
        overallHealthScore: health?.score || 80,
        progressRate,
        totalGoals: goals.length,
        atRiskGoals: atRisk,
        completedGoals: completed
      },
      goals: goals.slice(0, 10).map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        status: g.status,
        priority: g.priority,
        targetDate: g.targetDate
      })),
      kpis: metrics.slice(0, 8).map(m => ({
        id: m.id,
        name: m.name,
        current: m.currentValue,
        target: m.targetValue,
        unit: m.unit,
        progress: m.targetValue > 0 ? Math.round((m.currentValue / m.targetValue) * 100) : 0
      }))
    };
  }
}
