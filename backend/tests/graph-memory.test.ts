import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryService } from '../src/services/memory.service.js';
import { TimelineService } from '../src/services/timeline.service.js';
import { GraphService } from '../src/services/graph.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    memorySource: { create: vi.fn() },
    memory: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    timelineEvent: { create: vi.fn(), findMany: vi.fn() },
    ecosystemRelationship: { findMany: vi.fn() },
    goal: { findMany: vi.fn() },
    recommendation: { findMany: vi.fn() },
    decision: { findMany: vi.fn() }
  }
}));

vi.mock('../src/services/context.service.js', () => ({
  ContextService: {
    resolve: vi.fn().mockResolvedValue({
      user: { id: 'test-user-id' },
      business: { id: 'test-business-id' }
    })
  }
}));

describe('Graph & Memory Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('MemoryService: should upsert memory', async () => {
    vi.mocked(prisma.memory.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.memorySource.create).mockResolvedValue({ id: 's1' } as any);
    vi.mocked(prisma.memory.create).mockResolvedValue({ id: 'm1' } as any);

    await MemoryService.upsertMemory({ userId: 'test' }, 'test_key', { val: 1 }, 'STRATEGIC');
    expect(prisma.memorySource.create).toHaveBeenCalled();
    expect(prisma.memory.create).toHaveBeenCalled();
  });

  it('TimelineService: should add event', async () => {
    vi.mocked(prisma.timelineEvent.create).mockResolvedValue({ id: 'e1' } as any);
    await TimelineService.addEvent({ userId: 'test' }, { eventType: 'MILESTONE', title: 'Start' });
    expect(prisma.timelineEvent.create).toHaveBeenCalled();
  });

  it('GraphService: should retrieve business graph', async () => {
    vi.mocked(prisma.ecosystemRelationship.findMany).mockResolvedValue([]);
    vi.mocked(prisma.goal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.recommendation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.decision.findMany).mockResolvedValue([]);

    const graph = await GraphService.getBusinessGraph({ userId: 'test' });
    expect(graph).toHaveProperty('relationships');
    expect(graph).toHaveProperty('goals');
    expect(graph).toHaveProperty('recommendations');
    expect(graph).toHaveProperty('decisions');
  });
});
