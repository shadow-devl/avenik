import { prisma } from '../../db.js';

export class AdvancedSupportExecutionService {
  static async getMetrics(businessId: string) {
    const engagements = await prisma.opportunityEngagement.findMany({
      where: {
        businessId
      },
      orderBy: { appliedAt: 'desc' }
    });

    const actions = await prisma.action.findMany({
      where: {
        businessId,
        category: 'COMPLIANCE'
      },
      orderBy: { dueDate: 'asc' }
    });

    let totalPotentialValue = 0;
    let totalSecuredValue = 0;
    let activeApplications = 0;
    let inNegotiation = 0;

    engagements.forEach(e => {
      // Mocking amount since amount is not on Opportunity
      const mockAmount = 50000;
      
      if (e.status === 'WON') {
        totalSecuredValue += mockAmount;
      } else if (e.status !== 'LOST' && e.status !== 'DISMISSED') {
        activeApplications++;
        totalPotentialValue += mockAmount;
        if (e.status === 'NEGOTIATING') {
          inNegotiation++;
        }
      }
    });

    const overdueCompliance = actions.filter(a => a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'DONE').length;

    return {
      overview: {
        activeApplications,
        inNegotiation,
        totalPotentialValue,
        totalSecuredValue,
        overdueCompliance
      },
      activeFunnel: engagements.filter(e => e.status !== 'WON' && e.status !== 'LOST' && e.status !== 'DISMISSED').slice(0, 10).map(e => ({
        id: e.id,
        title: "Government Scheme",
        status: e.status,
        amount: 50000,
        likelihood: e.matchConfidence || 0
      })),
      complianceTasks: actions.slice(0, 10).map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        dueDate: a.dueDate,
        priority: a.priority
      }))
    };
  }
}
