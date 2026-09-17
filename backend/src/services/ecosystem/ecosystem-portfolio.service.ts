import { prisma } from '../../db.js';

export class EcosystemPortfolioService {
  static async getPortfolioMetrics(businessId: string) {
    // 1. Fetch direct connections/relationships
    const relationships = await prisma.ecosystemRelationship.findMany({
      where: {
        OR: [
          { sourceBusinessId: businessId },
          { targetBusinessId: businessId }
        ]
      },
      include: {
        sourceBusiness: { select: { id: true, businessName: true, industry: true } },
        targetBusiness: { select: { id: true, businessName: true, industry: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 2. Fetch network participation
    const networks = await prisma.globalEcosystemNetwork.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    let activeConnections = 0;
    let totalHealthScore = 0;
    let scoredConnections = 0;

    const portfolio: any[] = [];

    relationships.forEach(rel => {
      const isSource = rel.sourceBusinessId === businessId;
      const partner = isSource ? rel.targetBusiness : rel.sourceBusiness;
      
      if (rel.status === 'ACTIVE' || rel.status === 'CONSENTED') {
        activeConnections++;
        if (rel.healthScore != null) {
          totalHealthScore += rel.healthScore;
          scoredConnections++;
        }
      }

      portfolio.push({
        id: rel.id,
        partnerName: partner?.businessName || 'Unknown Entity',
        industry: partner?.industry || 'Unknown',
        type: rel.relationshipType,
        status: rel.status,
        health: rel.healthScore,
        direction: isSource ? 'OUTBOUND' : 'INBOUND'
      });
    });

    const averageHealth = scoredConnections > 0 ? Math.round(totalHealthScore / scoredConnections) : 85;

    return {
      overview: {
        activeConnections,
        totalNetworks: networks.length,
        averageNetworkHealth: averageHealth,
        totalNetworkCapacity: networks.reduce((sum, n) => sum + n.capacityScore, 0)
      },
      networks: networks.map(n => ({
        id: n.id,
        type: n.networkType,
        region: n.region,
        nodes: n.activeNodes,
        status: n.status
      })),
      portfolio: portfolio.slice(0, 15)
    };
  }
}
