import { prisma } from '../../db.js';

export class OperationsService {
  /**
   * Evaluates operational risks (Supply chain, infrastructure)
   */
  static async evaluateRisk(businessId: string, riskArea: string, severity: string) {
    const risk = await prisma.operationalRisk.create({
      data: {
        businessId,
        riskArea,
        severity
      }
    });

    return {
      risk,
      mitigation: severity === 'CRITICAL' || severity === 'HIGH'
        ? `Immediate action required for ${riskArea}. Establish redundancies.`
        : `Monitor ${riskArea} periodically.`
    };
  }
}
