import { prisma } from '../../db.js';
import { Business, EcosystemRelationship } from '@prisma/client';

export class EcosystemDiscoveryService {
  /**
   * Discovers relevant businesses or users based on industry, gaps, and location.
   */
  static async discoverMatches(businessId: string): Promise<any[]> {
    const sourceBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        goals: true,
        healthRecords: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!sourceBusiness) throw new Error('Business not found');

    // Simple heuristic match (In a real system, this would use embeddings)
    const matches = await prisma.business.findMany({
      where: {
        id: { not: businessId },
        businessStatus: 'ACTIVE',
        // Anti-popularity bias: find newer or less connected businesses sometimes
      },
      take: 10
    });

    // Score and shape them
    return matches.map(target => {
      let score = 0.5; // Base score
      
      // Heuristic: If they are in the same country, score goes up
      if (sourceBusiness.countryCode && target.countryCode === sourceBusiness.countryCode) {
        score += 0.2;
      }

      return {
        targetBusinessId: target.id,
        name: target.displayName,
        country: target.countryCode,
        matchScore: score,
        connectionContext: 'Potential strategic complementarity based on market location.'
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
}
