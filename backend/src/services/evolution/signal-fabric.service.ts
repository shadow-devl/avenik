import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Phase 13.1 — Intelligence Fabric 2.0: Unified Signal Management
 */
export class SignalFabricService {
  /**
   * Create a new intelligence signal.
   */
  static async createSignal(businessId: string, data: {
    domain: string; signalType: string; title: string; description?: string;
    impact?: string; urgency?: string; confidence?: number; evidence?: any[];
    explanation?: any;
  }) {
    return prisma.intelligenceSignal.create({
      data: {
        businessId,
        domain: data.domain,
        signalType: data.signalType,
        title: data.title,
        description: data.description,
        impact: data.impact || 'MEDIUM',
        urgency: data.urgency || 'MEDIUM',
        confidence: data.confidence || 0.5,
        evidence: data.evidence || [],
        explanation: data.explanation,
      },
    });
  }

  /**
   * Get prioritized signals for a business.
   * Prioritizes by: impact → urgency → confidence (descending).
   */
  static async getPrioritizedSignals(businessId: string, filters?: { domain?: string; status?: string }) {
    const signals = await prisma.intelligenceSignal.findMany({
      where: {
        businessId,
        ...(filters?.domain && { domain: filters.domain }),
        status: filters?.status || 'ACTIVE',
      },
      orderBy: [
        { impact: 'desc' },
        { urgency: 'desc' },
        { confidence: 'desc' },
      ],
      take: 50,
    });

    // Assign priority score
    const impactWeights: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const urgencyWeights: Record<string, number> = { IMMEDIATE: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    return signals.map(s => ({
      ...s,
      priorityScore:
        (impactWeights[s.impact] || 1) * 3 +
        (urgencyWeights[s.urgency] || 1) * 2 +
        s.confidence * 2,
    })).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Aggregate business state from cross-domain signals.
   */
  static async getBusinessState(businessId: string) {
    const signals = await prisma.intelligenceSignal.findMany({
      where: { businessId, status: 'ACTIVE' },
    });

    const domainCounts: Record<string, { total: number; critical: number; opportunities: number }> = {};
    for (const s of signals) {
      if (!domainCounts[s.domain]) domainCounts[s.domain] = { total: 0, critical: 0, opportunities: 0 };
      domainCounts[s.domain].total++;
      if (s.impact === 'CRITICAL' || s.impact === 'HIGH') domainCounts[s.domain].critical++;
      if (s.signalType === 'OPPORTUNITY') domainCounts[s.domain].opportunities++;
    }

    return {
      totalSignals: signals.length,
      criticalSignals: signals.filter(s => s.impact === 'CRITICAL').length,
      opportunities: signals.filter(s => s.signalType === 'OPPORTUNITY').length,
      risks: signals.filter(s => s.signalType === 'RISK' || s.signalType === 'DETERIORATION').length,
      byDomain: domainCounts,
    };
  }

  /**
   * Acknowledge or resolve a signal.
   */
  static async updateSignalStatus(id: string, status: string) {
    return prisma.intelligenceSignal.update({
      where: { id },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    });
  }
}
