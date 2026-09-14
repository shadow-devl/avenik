import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrustService } from '../src/services/trust.service.js';
import { FraudService } from '../src/services/fraud.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    verificationClaim: { create: vi.fn(), findMany: vi.fn() },
    fraudCase: { create: vi.fn(), findMany: vi.fn() }
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

describe('Trust & Fraud Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TrustService: should submit a verification claim', async () => {
    vi.mocked(prisma.verificationClaim.create).mockResolvedValue({ id: 'vc1', type: 'IDENTITY' } as any);

    const claim = await TrustService.submitVerificationClaim({ userId: 'test' }, { type: 'IDENTITY', data: {} });
    expect(prisma.verificationClaim.create).toHaveBeenCalled();
    expect(claim.type).toBe('IDENTITY');
  });

  it('FraudService: should report fraud', async () => {
    vi.mocked(prisma.fraudCase.create).mockResolvedValue({ id: 'fc1', type: 'IDENTITY_THEFT' } as any);

    const fcase = await FraudService.reportFraud({ userId: 'test' }, { type: 'IDENTITY_THEFT', severity: 'HIGH', details: 'Test' });
    expect(prisma.fraudCase.create).toHaveBeenCalled();
    expect(fcase.type).toBe('IDENTITY_THEFT');
  });
});
