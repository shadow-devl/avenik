import { prisma } from '../../db.js';

export class AdvancedSupportExecutionService {
  static async getMetrics(businessId: string) {
    const engagements = await prisma.opportunityEngagement.findMany({
      where: {
        businessId,
        opportunity: { type: 'GOVERNMENT_SUPPORT' }
      },
      include: { opportunity: true },
      orderBy: { updatedAt: 'desc' }
    });

    const actions = await prisma.action.findMany({
      where: {
        businessId,
        source: { in: ['APPLICATION', 'GOVERNMENT', 'COMPLIANCE'] }
      },
      orderBy: { dueDate: 'asc' }
    });

    let activeApplications = 0;
    let potentialValue = 0;
    let securedValue = 0;
    let pendingActions = 0;
    let overdueActions = 0;

    engagements.forEach(e => {
      if (e.status === 'APPLIED' || e.status === 'NEGOTIATING' || e.status === 'REVIEWING') {
        activeApplications++;
        potentialValue += (e.opportunity.amount || 0);
      }
      if (e.status === 'SECURED' || e.status === 'CLOSED_WON') {
        securedValue += (e.opportunity.amount || 0);
      }
    });

    const now = new Date();
    actions.forEach(a => {
      if (a.status !== 'DONE' && a.status !== 'CANCELLED') {
        pendingActions++;
        if (a.dueDate && new Date(a.dueDate) < now) {
          overdueActions++;
        }
      }
    });

    return {
      overview: {
        activeApplications,
        potentialValue,
        securedValue,
        pendingActions,
        overdueActions
      },
      pipeline: engagements.slice(0, 10).map(e => ({
        id: e.id,
        title: e.opportunity.title,
        status: e.status,
        amount: e.opportunity.amount,
        likelihood: e.likelihood
      })),
      executionTasks: actions.slice(0, 10).map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        priority: a.priority,
        dueDate: a.dueDate,
        overdue: a.dueDate ? new Date(a.dueDate) < now && a.status !== 'DONE' : false
      }))
    };
  }
}
