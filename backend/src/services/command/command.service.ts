import { prisma } from '../../db.js';

export class CommandService {
  /**
   * Generates a unified intelligence summary across all modules
   * (Finance, Commerce, Workforce, Operations, Strategy)
   */
  static async generateUnifiedSummary(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        financialRecords: { take: 5 },
        CommercialExpansionPlan: { take: 5 },
        WorkforceCapacity: { take: 5 },
        OperationalRisk: { take: 5 },
        GrowthScenario: { take: 5 }
      }
    });

    if (!business) throw new Error('Business not found');

    const totalRisks = business.OperationalRisk.length;
    const criticalRisks = business.OperationalRisk.filter(r => r.severity === 'CRITICAL').length;

    return {
      businessId,
      name: business.displayName,
      financials: {
        records: business.financialRecords.length
      },
      expansion: {
        activePlans: business.CommercialExpansionPlan.length
      },
      workforce: {
        overloadedRoles: business.WorkforceCapacity.filter(c => c.overloaded).length
      },
      operations: {
        totalRisks,
        criticalRisks
      },
      strategy: {
        scenarios: business.GrowthScenario.length
      },
      actionItems: criticalRisks > 0 
        ? 'URGENT: Mitigate critical operational risks immediately.'
        : 'Business is operating within acceptable parameters.'
    };
  }
}
