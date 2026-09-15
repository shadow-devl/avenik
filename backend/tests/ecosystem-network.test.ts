import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/db.js';
import { EcosystemDiscoveryService } from '../src/services/ecosystem/ecosystem-discovery.service.js';
import { EcosystemRelationshipService } from '../src/services/ecosystem/ecosystem-relationship.service.js';
import { ContextService } from '../src/services/context.service.js';

describe('Phase 10.3 Ecosystem Network & Market-Access Intelligence', () => {
  let userA: any, userB: any;
  let businessA: any, businessB: any;

  beforeAll(async () => {
    // Create User A
    userA = await prisma.user.create({
      data: { name: 'Supplier Admin', email: `supplier_${Date.now()}@test.com`, status: 'ACTIVE' }
    });
    businessA = await prisma.business.create({
      data: { ownerUserId: userA.id, displayName: 'Supplier Corp', countryCode: 'IN', businessStatus: 'ACTIVE' }
    });

    // Create User B
    userB = await prisma.user.create({
      data: { name: 'Buyer Admin', email: `buyer_${Date.now()}@test.com`, status: 'ACTIVE' }
    });
    businessB = await prisma.business.create({
      data: { ownerUserId: userB.id, displayName: 'Buyer LLC', countryCode: 'IN', businessStatus: 'ACTIVE' }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.business.deleteMany({ where: { id: { in: [businessA.id, businessB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  });

  it('User A discovers User B in the ecosystem', async () => {
    const matches = await EcosystemDiscoveryService.discoverMatches(businessA.id);
    expect(matches).toBeInstanceOf(Array);
    
    const foundB = matches.find(m => m.targetBusinessId === businessB.id);
    expect(foundB).toBeDefined();
    expect(foundB?.matchScore).toBeGreaterThan(0);
  });

  it('User A can request a warm connection to User B', async () => {
    // Context check
    await expect(ContextService.resolve({ userId: userB.id, requestedBusinessId: businessA.id })).rejects.toThrow();

    const rel = await EcosystemRelationshipService.requestConnection(
      businessA.id,
      businessB.id,
      'Hello, we would like to supply you with parts.'
    );

    expect(rel.status).toBe('REQUESTED');
    expect(rel.sourceBusinessId).toBe(businessA.id);
  });

  it('User B can consent to the connection', async () => {
    // Find the requested connection
    const rels = await prisma.ecosystemRelationship.findMany({
      where: { targetBusinessId: businessB.id, status: 'REQUESTED' }
    });
    expect(rels.length).toBeGreaterThan(0);

    const rel = rels[0];

    // Consent
    const updated = await EcosystemRelationshipService.consentConnection(rel.id);
    expect(updated.status).toBe('CONSENTED');
  });
});
