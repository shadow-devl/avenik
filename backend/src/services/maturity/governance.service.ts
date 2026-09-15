import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Governance, Risk, Resilience, Security & Responsible AI
 */
export class GovernanceService {
  /**
   * Create or update a governance policy.
   */
  static async upsertPolicy(businessId: string, data: {
    domain: string; policyName: string; description?: string;
    controlType?: string; owner?: string; evidenceRequired?: boolean;
    reviewFrequency?: string; riskLevel?: string; mitigations?: any[];
  }) {
    const existing = await prisma.governancePolicy.findFirst({
      where: { businessId, domain: data.domain, policyName: data.policyName },
    });

    if (existing) {
      return prisma.governancePolicy.update({
        where: { id: existing.id },
        data: {
          description: data.description ?? existing.description,
          controlType: data.controlType ?? existing.controlType,
          owner: data.owner ?? existing.owner,
          evidenceRequired: data.evidenceRequired ?? existing.evidenceRequired,
          reviewFrequency: data.reviewFrequency ?? existing.reviewFrequency,
          riskLevel: data.riskLevel ?? existing.riskLevel,
          mitigations: (data.mitigations ?? existing.mitigations) as Prisma.InputJsonValue,
        },
      });
    }

    return prisma.governancePolicy.create({
      data: {
        businessId,
        domain: data.domain,
        policyName: data.policyName,
        description: data.description,
        controlType: data.controlType || 'MANUAL',
        owner: data.owner,
        evidenceRequired: data.evidenceRequired || false,
        reviewFrequency: data.reviewFrequency,
        riskLevel: data.riskLevel || 'MEDIUM',
        mitigations: data.mitigations || [],
      },
    });
  }

  /**
   * Get all policies for a business.
   */
  static async getPolicies(businessId: string, filters?: { domain?: string; status?: string }) {
    return prisma.governancePolicy.findMany({
      where: {
        businessId,
        ...(filters?.domain && { domain: filters.domain }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Run governance audit: check for overdue reviews, missing policies.
   */
  static async runAudit(businessId: string) {
    const policies = await prisma.governancePolicy.findMany({
      where: { businessId, status: 'ACTIVE' },
    });

    const now = new Date();
    const overdueReviews = policies.filter(p =>
      p.nextReviewAt && new Date(p.nextReviewAt) < now
    );
    const highRiskWithoutMitigation = policies.filter(p =>
      (p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL') &&
      (!p.mitigations || (Array.isArray(p.mitigations) && (p.mitigations as any[]).length === 0))
    );

    const requiredDomains = ['RISK', 'SECURITY', 'PRIVACY', 'AI', 'AGENT', 'TRUST'];
    const coveredDomains = [...new Set(policies.map(p => p.domain))];
    const missingDomains = requiredDomains.filter(d => !coveredDomains.includes(d));

    return {
      totalPolicies: policies.length,
      overdueReviews: overdueReviews.map(p => ({ id: p.id, policyName: p.policyName, domain: p.domain, nextReviewAt: p.nextReviewAt })),
      highRiskWithoutMitigation: highRiskWithoutMitigation.map(p => ({ id: p.id, policyName: p.policyName, riskLevel: p.riskLevel })),
      missingDomains,
      governanceScore: Math.max(0, 100 - (overdueReviews.length * 10) - (highRiskWithoutMitigation.length * 15) - (missingDomains.length * 5)),
    };
  }

  /**
   * Evaluate agent governance constraints (Responsible AI).
   */
  static async evaluateAgentRequest(businessId: string, agentAction: {
    agentName: string; tool: string; domain: string; riskLevel: string;
  }) {
    const policies = await prisma.governancePolicy.findMany({
      where: {
        businessId,
        domain: { in: ['AGENT', 'AI', agentAction.domain] },
        status: 'ACTIVE',
      },
    });

    const blocked = policies.some(p =>
      p.riskLevel === 'CRITICAL' && agentAction.riskLevel === 'HIGH'
    );

    const requiresApproval = agentAction.riskLevel === 'HIGH' || agentAction.riskLevel === 'CRITICAL';

    return {
      allowed: !blocked,
      requiresApproval,
      matchedPolicies: policies.map(p => ({ id: p.id, policyName: p.policyName, domain: p.domain })),
      reason: blocked ? 'Blocked by critical governance policy' : requiresApproval ? 'Requires human approval' : 'Allowed',
    };
  }
}
