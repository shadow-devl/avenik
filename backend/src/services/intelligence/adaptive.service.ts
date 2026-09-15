import { prisma } from '../../db.js';

export class AdaptiveIntelligenceService {
  /**
   * Generates proactive insights based on business state
   */
  static async detectChanges(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        financialRecords: true,
        WorkforceCapacity: true,
        OperationalRisk: true
      }
    });

    if (!business) throw new Error('Business not found');

    const insights = [];

    // Check financial runway
    const inflows = business.financialRecords.filter(r => r.type === 'INFLOW').reduce((sum, r) => sum + r.amount, 0);
    const outflows = business.financialRecords.filter(r => r.type === 'OUTFLOW').reduce((sum, r) => sum + r.amount, 0);
    if (outflows > inflows && outflows > 0) {
      insights.push({
        domain: 'FINANCE',
        title: 'Runway Deterioration',
        description: 'Outflows exceed inflows. Runway is reducing.',
        severity: 'HIGH',
        urgency: 'URGENT',
        impactScore: 85,
        confidence: 0.95
      });
    }

    // Check workforce
    const overloadedRoles = business.WorkforceCapacity.filter(c => c.overloaded);
    if (overloadedRoles.length > 0) {
      insights.push({
        domain: 'WORKFORCE',
        title: 'Capability Gap Detected',
        description: `${overloadedRoles.length} roles are overloaded.`,
        severity: 'MEDIUM',
        urgency: 'HIGH',
        impactScore: 60,
        confidence: 0.85
      });
    }

    // Save insights
    const saved = await Promise.all(
      insights.map(insight => 
        prisma.proactiveInsight.create({
          data: { ...insight, businessId }
        })
      )
    );

    return saved;
  }

  /**
   * Adaptive prioritization engine
   */
  static async getWhatMattersNow(businessId: string) {
    const insights = await prisma.proactiveInsight.findMany({
      where: { businessId, status: 'UNREAD' },
      orderBy: { impactScore: 'desc' },
      take: 5
    });

    return insights;
  }

  /**
   * Level 0-6 Autonomous Execution Engine
   */
  static async executeAutonomousAction(businessId: string, userId: string, actionName: string, autonomyLevel: number) {
    // Level 6 requires strict human approval
    const requiresApproval = autonomyLevel >= 6;
    
    // AI Safety Constraints
    const forbiddenActions = ['MOVE_MONEY', 'CHANGE_OWNERSHIP', 'BINDING_LEGAL'];
    if (forbiddenActions.includes(actionName)) {
      return await prisma.agentExecution.create({
        data: {
          businessId,
          requestedBy: userId,
          actionName,
          autonomyLevel,
          status: 'BLOCKED_BY_SAFETY',
          safetyReason: 'Action forbidden by core AI safety constraints.'
        }
      });
    }

    return await prisma.agentExecution.create({
      data: {
        businessId,
        requestedBy: userId,
        actionName,
        autonomyLevel,
        status: requiresApproval ? 'PENDING_APPROVAL' : 'SUCCESS',
        executedAt: requiresApproval ? null : new Date()
      }
    });
  }
}
