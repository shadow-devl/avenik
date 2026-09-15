import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { prisma } from '../src/db.js';

describe('Phase 11: Global Adaptive Intelligence Evolution', () => {
  let businessId: string;

  beforeAll(async () => {
    const business = await prisma.business.create({
      data: {
        name: 'Phase 11 Test Corp', displayName: 'Phase 11 Test Corp',
        businessType: 'B2B',
        industry: 'AI',
        legalName: 'Phase 11 Test Corp Ltd',
        financialRecords: {
          create: [
            { type: 'INFLOW', amount: 5000, date: new Date(), description: 'Revenue' },
            { type: 'OUTFLOW', amount: 8000, date: new Date(), description: 'Expenses' }
          ]
        },
        workforceCapacities: {
          create: [
            { role: 'Engineering Lead', overloaded: true, estimatedGapHrs: 20 },
            { role: 'Sales Rep', overloaded: false, estimatedGapHrs: 0 }
          ]
        }
      }
    });
    businessId = business.id;
  });

  afterAll(async () => {
    await prisma.business.delete({ where: { id: businessId } });
  });

  it('11.1 Detects changes and surfaces proactive insights', async () => {
    const res = await request(app)
      .post(`/api/intelligence/insights/detect?businessId=${businessId}`)
      .send();
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    
    const titles = res.body.data.map((i: any) => i.title);
    expect(titles).toContain('Runway Deterioration');
    expect(titles).toContain('Capability Gap Detected');
  });

  it('11.1 Returns What Matters Now priorities ordered by impact', async () => {
    const res = await request(app)
      .get(`/api/intelligence/what-matters-now?businessId=${businessId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    // Runway (impact 85) should be before Capability Gap (impact 60)
    expect(res.body.data[0].impactScore).toBeGreaterThanOrEqual(res.body.data[1].impactScore);
  });

  it('11.1 Enforces Agent Safety constraints for Level 6 autonomy (Move Money)', async () => {
    const res = await request(app)
      .post('/api/intelligence/execute')
      .send({
        businessId,
        actionName: 'MOVE_MONEY',
        autonomyLevel: 6
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('BLOCKED_BY_SAFETY');
  });

  it('11.1 Places standard Level 6 actions into PENDING_APPROVAL', async () => {
    const res = await request(app)
      .post('/api/intelligence/execute')
      .send({
        businessId,
        actionName: 'UPDATE_SUPPLIER_CONTRACT',
        autonomyLevel: 6
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('11.1 Auto-executes low risk Level 3 actions', async () => {
    const res = await request(app)
      .post('/api/intelligence/execute')
      .send({
        businessId,
        actionName: 'GENERATE_DRAFT_REPORT',
        autonomyLevel: 3
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUCCESS');
    expect(res.body.data.executedAt).not.toBeNull();
  });
});
