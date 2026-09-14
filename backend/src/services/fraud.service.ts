import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class FraudService {
  static async reportFraud(contextReq: ContextRequest, data: any) {
    const context = await ContextService.resolve(contextReq);

    return prisma.fraudCase.create({
      data: {
        businessId: context.business!.id,
        type: data.type,
        severity: data.severity,
        details: data.details,
        status: 'OPEN'
      }
    });
  }

  static async getFraudCases(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    return prisma.fraudCase.findMany({
      where: { businessId: context.business!.id },
      orderBy: { createdAt: 'desc' }
    });
  }
}
