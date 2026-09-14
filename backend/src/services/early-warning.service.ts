import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class EarlyWarningService {
  static async checkWarnings(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    // Get health, financials, risks
    const health = await prisma.businessHealth.findFirst({
      where: { businessId: context.business!.id },
      orderBy: { calculatedAt: 'desc' }
    });

    const warnings = [];

    if (health && health.score < 40) {
      warnings.push(await prisma.earlyWarning.create({
        data: {
          businessId: context.business!.id,
          type: 'OVERALL_HEALTH',
          severity: 'HIGH',
          message: 'Business health score has dropped below the safe threshold (40).',
          evidence: `Score is ${health.score}`
        }
      }));
    }

    if (health && health.financialScore !== null && health.financialScore < 40) {
      warnings.push(await prisma.earlyWarning.create({
        data: {
          businessId: context.business!.id,
          type: 'FINANCIAL_BURN',
          severity: 'CRITICAL',
          message: 'High financial burn rate detected compared to inflows.',
          evidence: `Financial score is ${health.financialScore}`
        }
      }));
    }

    return warnings;
  }

  static async getWarnings(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    
    return prisma.earlyWarning.findMany({
      where: { businessId: context.business!.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
  }
}
