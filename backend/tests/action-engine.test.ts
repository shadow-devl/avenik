import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionService } from '../src/services/action.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    action: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    actionDependency: {
      create: vi.fn(),
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

describe('Action Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an action successfully', async () => {
    const mockAction = { id: 'action-1', title: 'Test Action', type: 'ACTION' };
    vi.mocked(prisma.action.create).mockResolvedValue(mockAction as any);

    const result = await ActionService.createAction(
      { userId: 'test' },
      { title: 'Test Action' }
    );

    expect(prisma.action.create).toHaveBeenCalled();
    expect(result.id).toBe('action-1');
  });

  it('should not allow completing an action if dependencies are incomplete', async () => {
    const mockAction = {
      id: 'action-1',
      dependencies: [
        { type: 'BLOCKS', dependsOnAction: { status: 'TODO' } }
      ]
    };
    vi.mocked(prisma.action.findFirst).mockResolvedValue(mockAction as any);

    await expect(
      ActionService.updateStatus({ userId: 'test' }, 'action-1', 'DONE')
    ).rejects.toThrow('Cannot complete action: unmet dependencies');
  });
});
