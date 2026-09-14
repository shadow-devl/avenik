import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class FundingService {
  static async createFundingRequest(contextReq: ContextRequest, data: any) {
    const context = await ContextService.resolve(contextReq);

    return prisma.fundingRequest.create({
      data: {
        businessId: context.business!.id,
        amount: data.amount,
        purpose: data.purpose,
        status: data.status || 'DRAFT',
        timeline: data.timeline
      }
    });
  }

  static async getFundingRequests(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    return prisma.fundingRequest.findMany({
      where: { businessId: context.business!.id },
      include: { options: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async addFundingOption(contextReq: ContextRequest, requestId: string, data: any) {
    const context = await ContextService.resolve(contextReq);

    // Verify ownership
    const request = await prisma.fundingRequest.findFirst({
      where: { id: requestId, businessId: context.business!.id }
    });
    if (!request) throw new Error('Funding request not found');

    return prisma.fundingOption.create({
      data: {
        fundingRequestId: requestId,
        providerName: data.providerName,
        type: data.type,
        amount: data.amount,
        interestRate: data.interestRate,
        matchScore: data.matchScore
      }
    });
  }
}
