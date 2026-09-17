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
      where: { businessId },
      orderBy: { npsScore: 'desc' }
    });

    let totalNps = 0;
    let validSegments = 0;
    
    segments.forEach(s => {
      if (s.npsScore != null) {
        totalNps += s.npsScore;
        validSegments++;
      }
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
        nps: s.npsScore,
        satisfaction: s.readiness // Co-opting readiness as a proxy for satisfaction if needed
      }))
    };
  }
}
