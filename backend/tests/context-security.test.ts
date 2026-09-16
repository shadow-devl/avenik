import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/server';
import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/index';

const prisma = new PrismaClient();

describe('Context Security & Isolation', () => {
  let userA_Id: string;
  let userA_Token: string;
  let businessA_Id: string;

  let userB_Id: string;
  let userB_Token: string;
  let businessB_Id: string;

  beforeAll(async () => {
    // Clean up stale test data from prior runs
    await prisma.business.deleteMany({ where: { displayName: { in: ['Business A', 'Business B'] } } });
    await prisma.user.deleteMany({ where: { email: { in: ['userA@avenik.com', 'userB@avenik.com'] } } });

    // User A
    const userA = await prisma.user.create({
      data: { email: 'userA@avenik.com', name: 'User A' }
    });
    userA_Id = userA.id;
    userA_Token = jwt.sign({ userId: userA.id, email: userA.email, roles: ['ENTREPRENEUR'] }, config.jwtSecret);

    const businessA = await prisma.business.create({
      data: { ownerUserId: userA.id, displayName: 'Business A' }
    });
    businessA_Id = businessA.id;

    // User B
    const userB = await prisma.user.create({
      data: { email: 'userB@avenik.com', name: 'User B' }
    });
    userB_Id = userB.id;
    userB_Token = jwt.sign({ userId: userB.id, email: userB.email, roles: ['ENTREPRENEUR'] }, config.jwtSecret);

    const businessB = await prisma.business.create({
      data: { ownerUserId: userB.id, displayName: 'Business B' }
    });
    businessB_Id = businessB.id;
  }, 30000);

  afterAll(async () => {
    const bIds = [businessA_Id, businessB_Id].filter(Boolean);
    const uIds = [userA_Id, userB_Id].filter(Boolean);
    if (bIds.length) await prisma.business.deleteMany({ where: { id: { in: bIds } } });
    if (uIds.length) await prisma.user.deleteMany({ where: { id: { in: uIds } } });
    await prisma.$disconnect();
  }, 30000);

  it('User A can resolve context for Business A', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessA_Id}`)
      .set('Authorization', `Bearer ${userA_Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.business.id).toBe(businessA_Id);
    expect(res.body.data.permissions).toContain('BUSINESS_READ');
  }, 15000);

  it('User B can resolve context for Business B', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessB_Id}`)
      .set('Authorization', `Bearer ${userB_Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.business.id).toBe(businessB_Id);
  }, 15000);

  it('SECURITY: User A CANNOT resolve context for Business B', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessB_Id}`)
      .set('Authorization', `Bearer ${userA_Token}`);
    
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Unauthorized business context');
  }, 15000);

  it('SECURITY: Missing token rejects context retrieval', async () => {
    const res = await request(app)
      .get(`/api/context/current?businessId=${businessA_Id}`);
    
    expect(res.status).toBe(401);
  }, 15000);
}, 15000);

