import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class TrustService {
  static async submitVerificationClaim(contextReq: ContextRequest, data: any) {
    const context = await ContextService.resolve(contextReq);

    return prisma.verificationClaim.create({
      data: {
        businessId: context.business!.id,
        type: data.type,
        data: data.data,
        evidenceUrl: data.evidenceUrl,
        status: 'PENDING'
      }
    });
  }

  static async getVerificationClaims(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    return prisma.verificationClaim.findMany({
      where: { businessId: context.business!.id },
      orderBy: { createdAt: 'desc' }
    });
  }
}
