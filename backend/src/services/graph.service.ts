import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class GraphService {
  static async getBusinessGraph(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    // Get nodes connected via EcosystemRelationship (which we already have in schema)
    const relationships = await prisma.ecosystemRelationship.findMany({
      where: {
        OR: [
          { sourceBusinessId: context.business!.id },
          { targetBusinessId: context.business!.id }
        ]
      },
      include: {
        sourceBusiness: true,
        targetBusiness: true,
        targetUser: true
      }
    });

    // Also get related entities like Goals, Recommendations, Decisions
    const goals = await prisma.goal.findMany({ where: { businessId: context.business!.id } });
    const recommendations = await prisma.recommendation.findMany({ where: { businessId: context.business!.id } });
    const decisions = await prisma.decision.findMany({ where: { businessId: context.business!.id } });

    return {
      relationships,
      goals,
      recommendations,
      decisions
    };
  }
}
