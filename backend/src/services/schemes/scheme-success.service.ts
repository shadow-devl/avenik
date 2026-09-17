import { prisma } from '../../db.js';

export class SchemeSuccessService {
  static async getApplicationMetrics(businessId: string) {
    const engagements = await prisma.opportunityEngagement.findMany({
      where: { businessId },
      include: {
        opportunity: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const govEngagements = engagements.filter(e => e.opportunity.type === 'GOVERNMENT_SUPPORT');
    
    let totalApplied = 0;
    let totalWon = 0;
    let totalLost = 0;
    let pending = 0;

    govEngagements.forEach(e => {
      if (['APPLIED', 'WON', 'LOST', 'NEGOTIATING', 'ENGAGED'].includes(e.status) || e.appliedAt) {
        totalApplied++;
      }
      if (e.status === 'WON') totalWon++;
      if (e.status === 'LOST') totalLost++;
      if (['APPLIED', 'ENGAGED', 'NEGOTIATING', 'INVESTIGATING', 'QUALIFIED', 'PURSUING'].includes(e.status)) {
        pending++;
      }
    });

    let successRate = totalApplied > 0 ? Math.round((totalWon / (totalWon + totalLost || 1)) * 100) : 0;
    if (totalWon === 0 && totalLost === 0) successRate = 0;

    return {
      successRate,
      totalApplied,
      totalWon,
      totalLost,
      pendingApplications: pending,
      recentApplications: govEngagements.map(e => ({
        id: e.id,
        schemeName: e.opportunity.title,
        provider: e.opportunity.providerName || e.opportunity.department,
        status: e.status,
        confidence: e.matchConfidence,
        appliedDate: e.appliedAt,
        lastUpdated: e.updatedAt
      })).slice(0, 10)
    };
  }
}
