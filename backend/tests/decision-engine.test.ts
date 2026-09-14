import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecommendationService } from '../src/services/recommendation.service.js';
import { DecisionService } from '../src/services/decision.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    recommendation: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    decision: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() }
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

describe('Recommendation & Decision Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RecommendationService: should fetch active and snoozed recommendations', async () => {
    vi.mocked(prisma.recommendation.findMany).mockResolvedValue([
      { id: 'r1', title: 'Test Rec' } as any
    ]);

    const recs = await RecommendationService.getRecommendations({ userId: 'test' });
    expect(recs.length).toBe(1);
    expect(prisma.recommendation.findMany).toHaveBeenCalledWith({
      where: { businessId: 'test-business-id', status: { in: ['ACTIVE', 'SNOOZED'] } },
      orderBy: [{ urgencyScore: 'desc' }, { confidenceScore: 'desc' }]
    });
  });

  it('DecisionService: should create a decision', async () => {
    vi.mocked(prisma.decision.create).mockResolvedValue({
      id: 'd1',
      title: 'Decide Pricing',
      status: 'PENDING'
    } as any);

    const decision = await DecisionService.createDecision({ userId: 'test' }, {
      title: 'Decide Pricing',
      description: 'Review pricing strategy'
    });

    expect(decision.id).toBe('d1');
    expect(decision.status).toBe('PENDING');
  });
});
