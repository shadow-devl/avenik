import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { success } from '../utils/response.js';

const router = Router();

// Endpoint to trigger Health Score Calculation
router.post('/calculate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'businessId is required' });
    }

    const business = await prisma.business.findUnique({
      where: {
        id: businessId
      },
      include: {
        financialRecords: {
          orderBy: {
            transactionDate: 'desc'
          },
          take: 1
        },
        risks: { where: { status: 'OPEN' } },
        trustProfile: true
      }
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Heuristics for Health Score
    // Base score is 50.
    let baseScore = 50;

    // Financial component
    const latestFinancials = business.financialRecords[0];
    if (latestFinancials) {
      if (latestFinancials.monthlyRevenue > latestFinancials.monthlyExpenses) {
        baseScore += 15; // Profitable
      } else {
        baseScore -= 10; // Loss making
      }
      if (latestFinancials.cashReserves > latestFinancials.monthlyExpenses * 3) {
        baseScore += 10; // Good runway
      }
    }

    // Risk component
    const highRisks = business.risks.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL');
    if (highRisks.length > 0) {
      baseScore -= (highRisks.length * 5); // Penalty for high risks
    }

    // Trust/Compliance component
    if (business.trustProfile) {
      if (business.trustProfile.verificationLevel === 'VERIFIED') baseScore += 15;
      if (business.trustProfile.verificationLevel === 'ADVANCED') baseScore += 25;
    }

    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, baseScore));

    const healthRecord = await prisma.businessHealth.create({
      data: {
        businessId: business.id,
        score: finalScore,
        financialScore: latestFinancials ? (latestFinancials.monthlyRevenue > latestFinancials.monthlyExpenses ? 80 : 40) : 50,
        riskScore: Math.max(0, 100 - (business.risks.length * 10)),
        operationsScore: 75,
        ecosystemScore: 60,
        aiInsights: `Calculated health score of ${finalScore} based on financial, risk, and trust metrics.`,
        calculatedAt: new Date(),
        dimension: 'OVERALL',
        trend: 'STABLE'
      }
    });

    success(res, healthRecord, 'Business health calculated successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
