import { prisma } from '../../db.js';

export class CustomerExperienceService {
  static async getMetrics(businessId: string) {
    const signals = await prisma.intelligenceSignal.findMany({
      where: {
        businessId,
        domain: 'CUSTOMER'
      },
      orderBy: { createdAt: 'desc' }
    });

    const segments = await prisma.customerSegment.findMany({
      where: { 
        plan: { businessId } 
      }
    });

    // Mock NPS for now since it's not directly in CustomerSegment
    let totalNps = 0;
    let validSegments = 0;
    
    segments.forEach(s => {
      // simulate nps score
      totalNps += 50; 
      validSegments++;
    });

    const averageNps = validSegments > 0 ? Math.round(totalNps / validSegments) : 45; // baseline NPS
    const activeRisks = signals.filter(s => s.signalType === 'RISK' || s.signalType === 'DETERIORATION').length;
    const activeOpportunities = signals.filter(s => s.signalType === 'OPPORTUNITY').length;

    return {
      overview: {
        averageNps,
        activeRisks,
        activeOpportunities,
        trackedSegments: segments.length
      },
      cxSignals: signals.slice(0, 10).map(s => ({
        id: s.id,
        type: s.signalType,
        title: s.title,
        impact: s.impact,
        urgency: s.urgency,
        confidence: s.confidence
      })),
      segmentSentiment: segments.map(s => ({
        id: s.id,
        name: s.name,
        nps: 50, // mock
        satisfaction: s.readiness
      }))
    };
  }
}
