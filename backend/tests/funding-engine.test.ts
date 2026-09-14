import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FundingService } from '../src/services/funding.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    fundingRequest: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    fundingOption: { create: vi.fn() }
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

describe('Funding Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FundingService: should create a funding request', async () => {
    vi.mocked(prisma.fundingRequest.create).mockResolvedValue({ id: 'fr1', amount: 50000 } as any);

    const req = await FundingService.createFundingRequest({ userId: 'test' }, { amount: 50000, purpose: 'Expansion' });
    expect(prisma.fundingRequest.create).toHaveBeenCalled();
    expect(req.amount).toBe(50000);
  });

  it('FundingService: should add a funding option', async () => {
    vi.mocked(prisma.fundingRequest.findFirst).mockResolvedValue({ id: 'fr1' } as any);
    vi.mocked(prisma.fundingOption.create).mockResolvedValue({ id: 'fo1', providerName: 'Bank' } as any);

    const opt = await FundingService.addFundingOption({ userId: 'test' }, 'fr1', { providerName: 'Bank', type: 'LOAN', amount: 50000 });
    expect(prisma.fundingOption.create).toHaveBeenCalled();
    expect(opt.providerName).toBe('Bank');
  });
});
