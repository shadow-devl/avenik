import { prisma } from '../../db.js';

export class RevenueOperationsService {
  static async getMetrics(businessId: string) {
    const revenueRecords = await prisma.financialRecord.findMany({
      where: {
        businessId,
        category: 'REVENUE',
        status: 'COMPLETED'
      },
      orderBy: { transactionDate: 'desc' }
    });

    const engagements = await prisma.opportunityEngagement.findMany({
      where: {
        businessId
      },
      orderBy: { appliedAt: 'desc' }
    });

    let totalRevenue = 0;
    let mrr = 0; 
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    revenueRecords.forEach(r => {
      totalRevenue += r.amount;
      if (new Date(r.transactionDate) >= thirtyDaysAgo) {
        mrr += r.amount;
      }
    });

    let pipelineValue = 0;
    let activeDeals = 0;

    engagements.forEach(e => {
      if (e.status === 'NEGOTIATING' || e.status === 'PURSUING' || e.status === 'QUALIFIED') {
        activeDeals++;
        pipelineValue += 10000; // Mock value since amount is not on opportunity
      }
    });

    return {
      overview: {
        totalRevenue,
        mrr,
        pipelineValue,
        activeDeals
      },
      revenueHistory: revenueRecords.slice(0, 5).map(r => ({
        id: r.id,
        amount: r.amount,
        currency: r.currency,
        date: r.transactionDate,
        description: r.description
      })),
      pipeline: engagements.slice(0, 10).map(e => ({
        id: e.id,
        title: "Commercial Deal", // Mock title
        status: e.status,
        amount: 10000, // Mock amount
        likelihood: e.matchConfidence || 0
      }))
    };
  }
}
