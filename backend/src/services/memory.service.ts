import { prisma } from '../db.js';
import { ContextService, ContextRequest } from './context.service.js';

export class MemoryService {
  static async setMemory(contextReq: ContextRequest, key: string, value: any, category: string, sourceType = 'SYSTEM') {
    const context = await ContextService.resolve(contextReq);

    const source = await prisma.memorySource.create({
      data: { type: sourceType }
    });

    return prisma.memory.upsert({
      where: {
        id: 'new', // Prisma upsert trick: we don't have a unique key combining businessId and key, we have to find it first if no unique constraint
      },
      create: {
        businessId: context.business!.id,
        key,
        value,
        category,
        sourceId: source.id
      },
      update: {}
    });
  }

  // Proper upsert because we missed unique constraint on [businessId, key]
  static async upsertMemory(contextReq: ContextRequest, key: string, value: any, category: string, sourceType = 'SYSTEM') {
    const context = await ContextService.resolve(contextReq);

    const existing = await prisma.memory.findFirst({
      where: { businessId: context.business!.id, key }
    });

    const source = await prisma.memorySource.create({
      data: { type: sourceType }
    });

    if (existing) {
      return prisma.memory.update({
        where: { id: existing.id },
        data: { value, category, sourceId: source.id, updatedAt: new Date() }
      });
    }

    return prisma.memory.create({
      data: {
        businessId: context.business!.id,
        key,
        value,
        category,
        sourceId: source.id
      }
    });
  }

  static async getMemories(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    return prisma.memory.findMany({
      where: { businessId: context.business!.id },
      include: { source: true },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
