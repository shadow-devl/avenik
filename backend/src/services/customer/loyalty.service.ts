import { prisma } from '../../db.js';

export class CustomerLoyaltyService {
  static async getLoyaltyMetrics(businessId: string) {
    const plans = await prisma.commercialExpansionPlan.findMany({
      where: { businessId },
      include: { segments: true }
    });

    const segments = plans.flatMap(p => p.segments);
    
    const signals = await prisma.intelligenceSignal.findMany({
      where: {
        businessId,
        domain: 'CUSTOMER'
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalReach = 0;
    let highReadiness = 0;

    segments.forEach(s => {
      totalReach += (s.size || 0);
      if (s.readiness === 'HIGH') {
        highReadiness += (s.size || 0);
      }
    });

    const loyaltyScore = totalReach > 0 ? Math.round((highReadiness / totalReach) * 100) : 0;
    const churnRisks = signals.filter(s => s.signalType === 'RISK' || s.signalType === 'DETERIORATION');
    const upsellOpps = signals.filter(s => s.signalType === 'OPPORTUNITY');

    return {
      loyaltyScore: loyaltyScore || 75, // Default if no data
      totalReach,
      highReadinessReach: highReadiness,
      churnRisksCount: churnRisks.length,
      upsellOppsCount: upsellOpps.length,
      segments: segments.map(s => ({
        id: s.id,
        name: s.name,
        size: s.size,
        readiness: s.readiness
      })),
      signals: signals.slice(0, 5).map(s => ({
        id: s.id,
        type: s.signalType,
        title: s.title,
        impact: s.impact,
        urgency: s.urgency,
        createdAt: s.createdAt
      }))
    };
  }
}
