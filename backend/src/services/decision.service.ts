import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class DecisionService {
  static async createDecision(contextReq: ContextRequest, data: any) {
    const context = await ContextService.resolve(contextReq);

    return prisma.decision.create({
      data: {
        businessId: context.business!.id,
        recommendationId: data.recommendationId,
        title: data.title,
        description: data.description,
        status: data.status || 'PENDING'
      }
    });
  }

  static async getDecisions(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    return prisma.decision.findMany({
      where: { businessId: context.business!.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateDecision(contextReq: ContextRequest, id: string, data: any) {
    const context = await ContextService.resolve(contextReq);

    const decision = await prisma.decision.findFirst({
      where: { id, businessId: context.business!.id }
    });

    if (!decision) throw new Error('Decision not found');

    return prisma.decision.update({
      where: { id },
      data: {
        status: data.status,
        selectedOption: data.selectedOption,
        rationale: data.rationale,
        outcome: data.outcome
      }
    });
  }
}
