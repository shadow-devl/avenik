import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class RecommendationService {
  static async getRecommendations(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    
    return prisma.recommendation.findMany({
      where: { 
        businessId: context.business!.id,
        status: { in: ['ACTIVE', 'SNOOZED'] }
      },
      orderBy: [
        { urgencyScore: 'desc' },
        { confidenceScore: 'desc' }
      ]
    });
  }

  static async getRecommendation(contextReq: ContextRequest, id: string) {
    const context = await ContextService.resolve(contextReq);
    
    return prisma.recommendation.findFirst({
      where: { 
        id,
        businessId: context.business!.id
      }
    });
  }

  static async updateStatus(contextReq: ContextRequest, id: string, status: 'ACCEPTED' | 'DECLINED' | 'SNOOZED' | 'DISMISSED') {
    const context = await ContextService.resolve(contextReq);
    
    const rec = await prisma.recommendation.findFirst({
      where: { id, businessId: context.business!.id }
    });

    if (!rec) throw new Error('Recommendation not found');

    return prisma.recommendation.update({
      where: { id },
      data: { status }
    });
  }
}
