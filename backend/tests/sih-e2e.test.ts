import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/server'; // assuming express app export
import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/index';

const prisma = new PrismaClient();

describe('SIH Phase 2 E2E Demonstration', () => {
  let businessId: string;
  let authToken: string;
  
  beforeAll(async () => {
    // Stage R: SIH END-TO-END DEMONSTRATION setup
    const user = await prisma.user.create({
      data: {
        email: 'sih-demo@avenik.com',
        name: 'SIH Demo',
      }
    });

    authToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret);

    const org = await prisma.organization.create({
      data: {
        name: 'SIH Demo Org',
      }
    });

    const business = await prisma.business.create({
      data: {
        ownerUserId: user.id,
        organizationId: org.id,
        displayName: 'Marginalized Entrepreneur Demo',
        countryCode: 'IN'
      }
    });
    
    businessId = business.id;
  });

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { displayName: 'Marginalized Entrepreneur Demo' }});
    await prisma.organization.deleteMany({ where: { name: 'SIH Demo Org' }});
    await prisma.user.deleteMany({ where: { email: 'sih-demo@avenik.com' }});
    await prisma.$disconnect();
  });

  it('1-3. Context Engine returns valid unified state', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('hasBusiness');
  }, 15000);

  it('4-11. Scheme Matching Engine returns explained results', async () => {
    const res = await request(app)
      .post('/api/schemes/match/match')
      .send({ businessId, filters: { industry: 'Tech', marginalizationStatus: true } });
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  it('16-17. NBA Engine triggers correctly for missing data', async () => {
    const res = await request(app)
      .post('/api/nba/generate')
      .send({ businessId });
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  it('18-19. Health Engine processes financial & trust signals', async () => {
    const res = await request(app)
      .post('/api/health-engine/calculate')
      .send({ businessId });
      
    expect(res.status).toBe(200);
    expect(typeof res.body.data.healthScore).toBe('number');
  }, 15000);
});
