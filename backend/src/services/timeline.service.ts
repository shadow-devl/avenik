import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class TimelineService {
  static async addEvent(contextReq: ContextRequest, data: any) {
    const context = await ContextService.resolve(contextReq);

    return prisma.timelineEvent.create({
      data: {
        businessId: context.business!.id,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {},
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date()
      }
    });
  }

  static async getEvents(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);

    return prisma.timelineEvent.findMany({
      where: { businessId: context.business!.id },
      orderBy: { occurredAt: 'desc' }
    });
  }
}
