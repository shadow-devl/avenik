import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class HealthService {
  static async calculateHealth(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    const business = await prisma.business.findUnique({
      where: { id: context.business!.id },
      include: {
        financialRecords: {
          orderBy: { transactionDate: 'desc' },
          take: 5
        },
        risks: { where: { status: 'OPEN' } },
        trustProfile: true,
        earlyWarnings: { where: { status: 'ACTIVE' } }
      }
    });

    if (!business) {
      throw new Error('Business not found for context');
    }

    let baseScore = 50;
    
    // Financial calculations
    let financialScore = 50;
    const revenues = business.financialRecords.filter(r => r.type === 'INFLOW');
    const expenses = business.financialRecords.filter(r => r.type === 'OUTFLOW');
    
    const totalRev = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExp = expenses.reduce((sum, r) => sum + r.amount, 0);

    if (totalRev > totalExp * 1.2) {
      baseScore += 15;
      financialScore = 85;
    } else if (totalExp > totalRev) {
      baseScore -= 15;
      financialScore = 30;
    }

    // Risk component
    let riskScore = 100;
    const highRisks = business.risks.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL');
    if (highRisks.length > 0) {
      baseScore -= (highRisks.length * 10);
      riskScore = Math.max(0, 100 - (highRisks.length * 20));
    }

    // Trust component
    let ecosystemScore = 50;
    if (business.trustProfile) {
      if (business.trustProfile.verificationLevel === 'VERIFIED') {
        baseScore += 15;
        ecosystemScore = 75;
      }
      if (business.trustProfile.verificationLevel === 'ADVANCED') {
        baseScore += 25;
        ecosystemScore = 95;
      }
    }

    // Warnings component
    if (business.earlyWarnings.length > 0) {
      baseScore -= (business.earlyWarnings.length * 5);
    }

    let operationsScore = 75; // Defaulted for now

    const finalScore = Math.max(0, Math.min(100, baseScore));
    let trend = 'STABLE';
    if (finalScore > 70) trend = 'UP';
    if (finalScore < 40) trend = 'DOWN';

    const healthRecord = await prisma.businessHealth.create({
      data: {
        businessId: business.id,
        score: finalScore,
        financialScore,
        riskScore,
        operationsScore,
        ecosystemScore,
        aiInsights: `Calculated overall health score of ${finalScore}.`,
        dimension: 'OVERALL',
        trend
      }
    });

    return healthRecord;
  }

  static async getLatestHealth(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    
    return prisma.businessHealth.findFirst({
      where: { businessId: context.business!.id, dimension: 'OVERALL' },
      orderBy: { calculatedAt: 'desc' }
    });
  }
}
