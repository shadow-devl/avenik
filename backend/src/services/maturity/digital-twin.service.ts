import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Entrepreneur Digital Twin & Personal Intelligence
 * Strengthens existing Digital Twin into a canonical entrepreneur intelligence layer.
 */
export class DigitalTwinService {
  /**
   * Sync or create the entrepreneur's digital twin for a given business.
   */
  static async syncDigitalTwin(userId: string, businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        goals: { where: { status: { not: 'COMPLETED' } }, take: 10, orderBy: { createdAt: 'desc' } },
        actions: { where: { status: { not: 'COMPLETED' } }, take: 10, orderBy: { createdAt: 'desc' } },
        CapabilityGap: { take: 10 },
        recommendations: { where: { status: 'PENDING' }, take: 5 },
        financialRecords: { take: 5, orderBy: { transactionDate: 'desc' } },
      },
    });

    if (!business) throw new Error('Business not found');

    const goals = (business.goals || []).map((g: any) => ({
      id: g.id, title: g.title, priority: g.priority, status: g.status,
    }));
    const priorities = goals.filter((g: any) => g.priority === 'HIGH' || g.priority === 'CRITICAL');
    const capabilities: string[] = [];
    const capabilityGaps = (business.CapabilityGap || []).map((cg: any) => ({
      id: cg.id, skillName: cg.skillName, currentLevel: cg.currentLevel, requiredLevel: cg.requiredLevel,
    }));
    const activeWorkContext = {
      activeGoals: goals.length,
      pendingActions: (business.actions || []).length,
      pendingRecommendations: (business.recommendations || []).length,
    };
    const personalizedGuidance = (business.recommendations || []).map((r: any) => ({
      id: r.id, title: r.title, reason: r.reason, category: r.category,
    }));

    const twin = await prisma.entrepreneurDigitalTwin.upsert({
      where: { userId_businessId: { userId, businessId } },
      update: {
        goals, priorities, capabilities, capabilityGaps,
        activeWorkContext, personalizedGuidance,
        lastSyncedAt: new Date(),
      },
      create: {
        userId, businessId,
        goals, priorities, capabilities, capabilityGaps,
        preferences: {},
        learningObjectives: [],
        activeWorkContext, personalizedGuidance,
      },
    });

    return twin;
  }

  /**
   * Get the current digital twin state.
   */
  static async getDigitalTwin(userId: string, businessId: string) {
    return prisma.entrepreneurDigitalTwin.findUnique({
      where: { userId_businessId: { userId, businessId } },
    });
  }

  /**
   * Update entrepreneur preferences.
   */
  static async updatePreferences(userId: string, businessId: string, preferences: Record<string, any>) {
    return prisma.entrepreneurDigitalTwin.update({
      where: { userId_businessId: { userId, businessId } },
      data: { preferences },
    });
  }
}
