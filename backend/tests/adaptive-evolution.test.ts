import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { prisma } from '../src/db.js';

describe('Global Adaptive Intelligence Evolution', () => {
  let businessId: string;

  beforeAll(async () => {
    const business = await prisma.business.create({
      data: {
        displayName: 'Test Corp',
        legalName: 'Test Corp Ltd',
        financialRecords: {
          create: [
            { type: 'INFLOW', amount: 5000, transactionDate: new Date(), description: 'Revenue', category: 'SALES' },
            { type: 'OUTFLOW', amount: 8000, transactionDate: new Date(), description: 'Expenses', category: 'OPEX' }
          ]
        },
        WorkforceCapacity: {
          create: [
            { roleName: 'Engineering Lead', overloaded: true, currentFTE: 1, requiredFTE: 2 },
            { roleName: 'Sales Rep', overloaded: false, currentFTE: 2, requiredFTE: 2 }
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
    
    if (res.status !== 200) console.log(res.body); expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    
    const titles = res.body.data.map((i: any) => i.title);
    expect(titles).toContain('Runway Deterioration');
    expect(titles).toContain('Capability Gap Detected');
  });

  it('11.1 Returns What Matters Now priorities ordered by impact', async () => {
    const res = await request(app)
      .get(`/api/intelligence/what-matters-now?businessId=${businessId}`);
    
    if (res.status !== 200) console.log(res.body); expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
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
    
    if (res.status !== 200) console.log(res.body); expect(res.status).toBe(200);
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
    
    if (res.status !== 200) console.log(res.body); expect(res.status).toBe(200);
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
    
    if (res.status !== 200) console.log(res.body); expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUCCESS');
    expect(res.body.data.executedAt).not.toBeNull();
  });
});
