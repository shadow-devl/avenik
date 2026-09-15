import { prisma } from '../../db.js';

export class EcosystemRelationshipService {
  /**
   * Request a connection (Warm Introduction) to another business.
   */
  static async requestConnection(sourceBusinessId: string, targetBusinessId: string, message: string) {
    const existing = await prisma.ecosystemRelationship.findFirst({
      where: {
        sourceBusinessId,
        targetBusinessId
      }
    });

    if (existing && existing.status !== 'DISCOVERED') {
      throw new Error(`Connection is already in state: ${existing.status}`);
    }

    // Identify who is sending it (the owner of the source business)
    const sourceBusiness = await prisma.business.findUnique({
      where: { id: sourceBusinessId }
    });

    if (!sourceBusiness || !sourceBusiness.ownerUserId) {
      throw new Error('Invalid source business');
    }

    return await prisma.ecosystemRelationship.upsert({
      where: {
        id: existing?.id || '00000000-0000-0000-0000-000000000000' // Prisma hack for upsert without unique constraint on source/target
      },
      update: {
        status: 'REQUESTED'
      },
      create: {
        sourceBusinessId,
        targetBusinessId,
        relationshipType: 'PARTNER',
        status: 'REQUESTED',
        messages: {
          create: {
            senderUserId: sourceBusiness.ownerUserId,
            content: message
          }
        }
      }
    });
  }

  /**
   * Target business owner consents to the connection.
   */
  static async consentConnection(relationshipId: string) {
    const rel = await prisma.ecosystemRelationship.findUnique({
      where: { id: relationshipId }
    });

    if (!rel || rel.status !== 'REQUESTED') {
      throw new Error('Relationship not found or not in REQUESTED state');
    }

    return await prisma.ecosystemRelationship.update({
      where: { id: relationshipId },
      data: { status: 'CONSENTED' }
    });
  }
}
