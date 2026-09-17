import { prisma } from '../../db.js';

export class FinancialIntelligenceService {
  static async getMetrics(businessId: string) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // 1. Fetch real-time transactions
    const records = await prisma.financialRecord.findMany({
      where: { businessId },
      orderBy: { transactionDate: 'desc' }
    });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let currentCashFlow = 0;
    
    // Aggregations
    records.forEach(r => {
      if (r.type === 'INFLOW' && r.category === 'REVENUE') totalRevenue += r.amount;
      if (r.type === 'OUTFLOW' && r.category === 'EXPENSE') totalExpenses += r.amount;
      currentCashFlow += (r.type === 'INFLOW' ? r.amount : -r.amount);
    });

    const monthlyBurn = totalExpenses > 0 ? (totalExpenses / 12) : 5000; // Mock fallback if little data
    const runwayMonths = currentCashFlow > 0 ? (currentCashFlow / monthlyBurn) : 0;

    // 2. Fetch AI Forecasts
    const forecasts = await prisma.forecast.findMany({
      where: { businessId },
      orderBy: { periodStart: 'asc' }
    });

    return {
      overview: {
        totalRevenue,
        totalExpenses,
        currentCashFlow,
        monthlyBurnRate: monthlyBurn,
        estimatedRunwayMonths: Math.round(runwayMonths * 10) / 10
      },
      recentTransactions: records.slice(0, 10).map(r => ({
        id: r.id,
        type: r.type,
        category: r.category,
        amount: r.amount,
        currency: r.currency,
        date: r.transactionDate,
        status: r.status
      })),
      forecasts: forecasts.map(f => ({
        id: f.id,
        metric: f.metricName,
        period: f.periodStart,
        predictedValue: f.predictedValue,
        confidenceLower: f.confidenceLower,
        confidenceUpper: f.confidenceUpper,
        assumptions: f.assumptions
      }))
    };
  }
}
