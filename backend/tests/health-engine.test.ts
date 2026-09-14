import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthService } from '../src/services/health.service.js';
import { ForecastService } from '../src/services/forecast.service.js';
import { EarlyWarningService } from '../src/services/early-warning.service.js';
import { prisma } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  prisma: {
    business: { findUnique: vi.fn() },
    businessHealth: { create: vi.fn(), findFirst: vi.fn() },
    forecast: { create: vi.fn(), findMany: vi.fn() },
    earlyWarning: { create: vi.fn(), findMany: vi.fn() },
    financialRecord: { findMany: vi.fn() }
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

describe('Health & Intelligence Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HealthService: should calculate overall health correctly', async () => {
    const mockBusiness = {
      id: 'test-business-id',
      financialRecords: [
        { type: 'INFLOW', amount: 50000 },
        { type: 'OUTFLOW', amount: 10000 }
      ],
      risks: [],
      trustProfile: { verificationLevel: 'ADVANCED' },
      earlyWarnings: []
    };
    
    vi.mocked(prisma.business.findUnique).mockResolvedValue(mockBusiness as any);
    vi.mocked(prisma.businessHealth.create).mockResolvedValue({ id: 'h1', score: 90 } as any);

    const result = await HealthService.calculateHealth({ userId: 'test' });
    expect(result.score).toBe(90);
    expect(prisma.businessHealth.create).toHaveBeenCalled();
  });

  it('ForecastService: should generate revenue and burn rate forecasts', async () => {
    vi.mocked(prisma.financialRecord.findMany).mockResolvedValue([
      { type: 'INFLOW', amount: 20000 },
      { type: 'OUTFLOW', amount: 5000 }
    ] as any);
    vi.mocked(prisma.forecast.create).mockImplementation(async ({ data }: any) => ({ id: 'f1', ...data }));

    const res = await ForecastService.generateForecast({ userId: 'test' });
    expect(res.revForecast.predictedValue).toBe(21000); // 20000 * 1.05
    expect(res.burnForecast.predictedValue).toBe(5100); // 5000 * 1.02
  });

  it('EarlyWarningService: should generate warnings if health is poor', async () => {
    vi.mocked(prisma.businessHealth.findFirst).mockResolvedValue({ score: 30, financialScore: 30 } as any);
    vi.mocked(prisma.earlyWarning.create).mockImplementation(async ({ data }: any) => ({ id: 'w1', ...data }));

    const warnings = await EarlyWarningService.checkWarnings({ userId: 'test' });
    expect(warnings.length).toBe(2);
    expect(warnings[0].type).toBe('OVERALL_HEALTH');
    expect(warnings[1].type).toBe('FINANCIAL_BURN');
  });
});
