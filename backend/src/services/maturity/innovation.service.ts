import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Phase 12.7 — Innovation, Research, Knowledge & Intellectual Capital
 */
export class InnovationService {
  /**
   * Create a new innovation record (idea, experiment, patent, etc.)
   */
  static async create(businessId: string, data: {
    type: string; title: string; description?: string;
    hypothesis?: string; metadata?: Record<string, any>;
  }) {
    return prisma.innovationRecord.create({
      data: {
        businessId,
        type: data.type,
        title: data.title,
        description: data.description,
        hypothesis: data.hypothesis,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Get innovation portfolio for a business.
   */
  static async getPortfolio(businessId: string, filters?: { type?: string; status?: string }) {
    return prisma.innovationRecord.findMany({
      where: {
        businessId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update innovation record with experiment results/learning.
   */
  static async updateResult(id: string, data: {
    status?: string; result?: string; learning?: string;
  }) {
    return prisma.innovationRecord.update({
      where: { id },
      data,
    });
  }

  /**
   * Get innovation summary with counts by type and status.
   */
  static async getSummary(businessId: string) {
    const records = await prisma.innovationRecord.findMany({
      where: { businessId },
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const r of records) {
      byType[r.type] = (byType[r.type] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }

    return {
      total: records.length,
      byType,
      byStatus,
      ipProtected: records.filter(r => ['PATENT', 'TRADEMARK', 'COPYRIGHT', 'TRADE_SECRET'].includes(r.type) && r.status === 'PROTECTED').length,
      experimentsValidated: records.filter(r => r.type === 'EXPERIMENT' && r.status === 'VALIDATED').length,
    };
  }
}
