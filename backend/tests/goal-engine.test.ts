import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalService } from '../src/services/goal.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    goal: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    }
  }
}));

// Mock ContextService
vi.mock('../src/services/context.service.js', () => ({
  ContextService: {
    resolve: vi.fn().mockResolvedValue({
      user: { id: 'test-user-id' },
      business: { id: 'test-business-id' }
    })
  }
}));

describe('Goal Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a goal successfully', async () => {
    const mockGoal = { id: 'goal-1', title: 'Test Goal', type: 'GOAL' };
    vi.mocked(prisma.goal.create).mockResolvedValue(mockGoal as any);

    const result = await GoalService.createGoal(
      { userId: 'test' },
      { title: 'Test Goal', category: 'FINANCIAL' }
    );

    expect(prisma.goal.create).toHaveBeenCalled();
    expect(result.id).toBe('goal-1');
  });

  it('should update progress and autocomplete goal', async () => {
    const mockGoal = { id: 'goal-1', status: 'ACTIVE' };
    vi.mocked(prisma.goal.findFirst).mockResolvedValue(mockGoal as any);
    vi.mocked(prisma.goal.update).mockResolvedValue({ ...mockGoal, status: 'COMPLETED', progress: 100 } as any);

    const result = await GoalService.updateProgress({ userId: 'test' }, 'goal-1', 100);

    expect(prisma.goal.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        progress: 100,
        status: 'COMPLETED'
      })
    }));
    expect(result.status).toBe('COMPLETED');
  });
});
