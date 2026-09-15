import { prisma } from '../../db.js';

export class CapitalService {
  /**
   * Calculates the capital gap for a business based on recent financial records and active funding requests.
   * CAPITAL REQUIRED - AVAILABLE CAPITAL = CAPITAL GAP
   */
  static async calculateCapitalGap(businessId: string): Promise<{
    availableCapital: number;
    capitalRequired: number;
    capitalGap: number;
  }> {
    // 1. Calculate Available Capital (Cash Inflows - Outflows)
    const records = await prisma.financialRecord.findMany({
      where: {
        businessId,
        status: 'COMPLETED'
      }
    });

    const availableCapital = records.reduce((acc, record) => {
      if (record.type === 'INFLOW') return acc + record.amount;
      if (record.type === 'OUTFLOW') return acc - record.amount;
      return acc;
    }, 0);

    // 2. Calculate Capital Required (Sum of all active FundingRequests)
    const requests = await prisma.fundingRequest.findMany({
      where: {
        businessId,
        status: { in: ['DRAFT', 'MATCHING', 'NEGOTIATING'] }
      }
    });

    const capitalRequired = requests.reduce((acc, req) => acc + req.amount, 0);

    // 3. Gap
    const capitalGap = Math.max(0, capitalRequired - availableCapital);

    return {
      availableCapital,
      capitalRequired,
      capitalGap
    };
  }

  /**
   * Assesses the business's readiness for external funding.
   */
  static async assessReadiness(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        financialRecords: { take: 10 },
        goals: { take: 1 }
      }
    });

    if (!business) throw new Error('Business not found');

    let score = 0;
    const checks = {
      identityVerified: false,
      hasFinancialHistory: false,
      hasClearGoal: false,
      isRegistered: !!business.registrationNumber
    };

    if (business.businessStatus === 'ACTIVE') {
      checks.identityVerified = true;
      score += 25;
    }
    
    if (business.financialRecords.length > 0) {
      checks.hasFinancialHistory = true;
      score += 25;
    }

    if (business.goals.length > 0) {
      checks.hasClearGoal = true;
      score += 25;
    }

    if (checks.isRegistered) {
      score += 25;
    }

    return {
      readinessScore: score,
      checks,
      status: score === 100 ? 'READY' : 'NEEDS_WORK'
    };
  }
}
