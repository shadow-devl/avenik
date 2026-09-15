import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Competitive Intelligence
 */
export class CompetitiveIntelService {
  /**
   * Add competitive intelligence entry.
   */
  static async addIntel(businessId: string, data: {
    competitorName: string; domain: string; insight: string;
    confidence?: number; source?: string; impactOnBusiness?: string;
  }) {
    return prisma.competitiveIntel.create({
      data: {
        businessId,
        competitorName: data.competitorName,
        domain: data.domain,
        insight: data.insight,
        confidence: data.confidence || 0.5,
        source: data.source,
        impactOnBusiness: data.impactOnBusiness,
      },
    });
  }

  /**
   * Get competitive landscape for a business.
   */
  static async getLandscape(businessId: string, filters?: { competitorName?: string; domain?: string }) {
    return prisma.competitiveIntel.findMany({
      where: {
        businessId,
        ...(filters?.competitorName && { competitorName: filters.competitorName }),
        ...(filters?.domain && { domain: filters.domain }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get competitive summary by competitor.
   */
  static async getSummary(businessId: string) {
    const intel = await prisma.competitiveIntel.findMany({
      where: { businessId },
    });

    const byCompetitor: Record<string, { domains: string[]; count: number; avgConfidence: number }> = {};
    for (const i of intel) {
      if (!byCompetitor[i.competitorName]) {
        byCompetitor[i.competitorName] = { domains: [], count: 0, avgConfidence: 0 };
      }
      byCompetitor[i.competitorName].count++;
      byCompetitor[i.competitorName].avgConfidence += i.confidence;
      if (!byCompetitor[i.competitorName].domains.includes(i.domain)) {
        byCompetitor[i.competitorName].domains.push(i.domain);
      }
    }

    for (const comp of Object.values(byCompetitor)) {
      comp.avgConfidence = comp.avgConfidence / comp.count;
    }

    return {
      totalEntries: intel.length,
      competitorCount: Object.keys(byCompetitor).length,
      byCompetitor,
    };
  }
}
