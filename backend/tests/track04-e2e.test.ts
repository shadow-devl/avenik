import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Track 04 E2E Required Journeys', () => {
  let userTokenA: string;
  let userTokenB: string;
  let businessIdA: string;
  let businessIdB: string;

  beforeAll(async () => {
    await prisma.business.deleteMany({ where: { displayName: { startsWith: 'Track04' } }});
    await prisma.user.deleteMany({ where: { email: { startsWith: 'track04_' } }});
  });

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { displayName: { startsWith: 'Track04' } }});
    await prisma.user.deleteMany({ where: { email: { startsWith: 'track04_' } }});
    await prisma.$disconnect();
  });

  it('TEST 1: OAuth Sync -> Login', async () => {
    const regRes = await request(app)
      .post('/api/auth/oauth')
      .send({ email: 'track04_a@avenik.com', name: 'Track 04 User A', provider: 'google', providerAccountId: '123' });
    expect(regRes.status).toBe(200);
    expect(regRes.body.data.token).toBeDefined();
    userTokenA = regRes.body.data.token;
    
    const regResB = await request(app)
      .post('/api/auth/oauth')
      .send({ email: 'track04_b@avenik.com', name: 'Track 04 User B', provider: 'google', providerAccountId: '456' });
    expect(regResB.status).toBe(200);
    userTokenB = regResB.body.data.token;
  }, 30000);

  it('TEST 2: Login -> Context (No Business Yet)', async () => {
    const ctxRes = await request(app)
      .get('/api/context/current')
      .set('Authorization', `Bearer ${userTokenA}`);
    
    expect([200, 404]).toContain(ctxRes.status);
  }, 30000);

  it('TEST 3: Create Business -> Persist -> Context', async () => {
    const createRes = await request(app)
      .post('/api/business')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ displayName: 'Track04 Business A', countryCode: 'IN' });
    expect(createRes.status).toBe(201);
    businessIdA = createRes.body.data.id;

    const ctxRes = await request(app)
      .get(`/api/context/current?businessId=${businessIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(ctxRes.status).toBe(200);
    expect(ctxRes.body.data.business.id).toBe(businessIdA);
    expect(ctxRes.body.data.business.displayName).toBe('Track04 Business A');
    
    const createResB = await request(app)
      .post('/api/business')
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({ displayName: 'Track04 Business B', countryCode: 'IN' });
    businessIdB = createResB.body.data.id;
  }, 30000);

  it('TEST 4: Business A cannot access Business B', async () => {
    const ctxRes = await request(app)
      .get(`/api/context/current?businessId=${businessIdB}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(ctxRes.status).toBe(403);
  }, 30000);

  it('TEST 6: Goal creation persists', async () => {
    const createRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${userTokenA}`)
      .set('x-business-id', businessIdA)
      .send({ title: 'Track04 Goal', targetDate: new Date().toISOString(), category: 'FINANCIAL' });
    expect(createRes.status).toBe(201);

    const getRes = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${userTokenA}`)
      .set('x-business-id', businessIdA);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThan(0);
    expect(getRes.body.data[0].title).toBe('Track04 Goal');
  }, 30000);

  it('TEST 7: Recommendation/NBA endpoint authorization', async () => {
    const nbaRes = await request(app)
      .post('/api/nba/generate')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ businessId: businessIdA });
    expect(nbaRes.status).toBe(200);

    const nbaResUnauth = await request(app)
      .post('/api/nba/generate')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ businessId: businessIdB });
    expect(nbaResUnauth.status).toBe(403);
  }, 15000);

  it('TEST 8: Scheme/opportunity matching authorization', async () => {
    const oppRes = await request(app)
      .post('/api/opportunities/match')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ businessId: businessIdA, filters: {} });
    expect(oppRes.status).toBe(200);

    const oppResUnauth = await request(app)
      .post('/api/opportunities/match')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ businessId: businessIdB, filters: {} });
    expect(oppResUnauth.status).toBe(403);
  }, 15000);

  it('TEST 9: Financial endpoint correctness', async () => {
    const finRes = await request(app)
      .get(`/api/finance/readiness?businessId=${businessIdA}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    expect(finRes.status).toBe(200);
    expect(finRes.body.data).toHaveProperty('readinessScore');
  }, 30000);

  it('TEST 11: Invalid JWT rejected', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessIdA}`)
      .set('Authorization', `Bearer invalid-token`);
    expect(res.status).toBe(401);
  }, 30000);
});
