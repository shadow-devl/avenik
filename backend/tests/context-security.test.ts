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
    // User A
    const userA = await prisma.user.create({
      data: { email: 'userA@avenik.com', name: 'User A' }
    }, 15000);
    userA_Id = userA.id;
    userA_Token = jwt.sign({ userId: userA.id, email: userA.email }, config.jwtSecret);

    const businessA = await prisma.business.create({
      data: { ownerUserId: userA.id, displayName: 'Business A' }
    }, 15000);
    businessA_Id = businessA.id;

    // User B
    const userB = await prisma.user.create({
      data: { email: 'userB@avenik.com', name: 'User B' }
    }, 15000);
    userB_Id = userB.id;
    userB_Token = jwt.sign({ userId: userB.id, email: userB.email }, config.jwtSecret);

    const businessB = await prisma.business.create({
      data: { ownerUserId: userB.id, displayName: 'Business B' }
    }, 15000);
    businessB_Id = businessB.id;
  }, 15000);

  afterAll(async () => {
    await prisma.business.deleteMany({ where: { id: { in: [businessA_Id, businessB_Id] } } }, 15000);
    await prisma.user.deleteMany({ where: { id: { in: [userA_Id, userB_Id] } } }, 15000);
    await prisma.$disconnect();
  }, 15000);

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

