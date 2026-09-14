import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class ForecastService {
  static async generateForecast(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    // Get last month's financial records
    const records = await prisma.financialRecord.findMany({
      where: { 
        businessId: context.business!.id,
        transactionDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    });

    const revenues = records.filter(r => r.type === 'INFLOW').reduce((sum, r) => sum + r.amount, 0);
    const expenses = records.filter(r => r.type === 'OUTFLOW').reduce((sum, r) => sum + r.amount, 0);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Simple projection
    const predictedRevenue = revenues > 0 ? revenues * 1.05 : 10000;
    const predictedBurn = expenses > 0 ? expenses * 1.02 : 8000;

    const [revForecast, burnForecast] = await Promise.all([
      prisma.forecast.create({
        data: {
          businessId: context.business!.id,
          metricName: 'REVENUE',
          periodStart: nextMonth,
          periodEnd: endOfNextMonth,
          predictedValue: predictedRevenue,
          confidenceLower: predictedRevenue * 0.9,
          confidenceUpper: predictedRevenue * 1.1,
          assumptions: 'Based on 5% MoM growth'
        }
      }),
      prisma.forecast.create({
        data: {
          businessId: context.business!.id,
          metricName: 'BURN_RATE',
          periodStart: nextMonth,
          periodEnd: endOfNextMonth,
          predictedValue: predictedBurn,
          confidenceLower: predictedBurn * 0.95,
          confidenceUpper: predictedBurn * 1.05,
          assumptions: 'Based on 2% MoM expense inflation'
        }
      })
    ]);

    return { revForecast, burnForecast };
  }

  static async getForecasts(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    
    return prisma.forecast.findMany({
      where: { businessId: context.business!.id },
      orderBy: { periodStart: 'asc' }
    });
  }
}
