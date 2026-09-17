import { prisma } from '../../db.js';

export class ResourceIntelligenceService {
  static async getMetrics(businessId: string) {
    const engines = await prisma.economicEngine.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const suppliers = await prisma.ecosystemRelationship.findMany({
      where: {
        sourceBusinessId: businessId,
        type: 'B2B_SUPPLIER'
      },
      include: {
        targetBusiness: true
      }
    });

    let macroScore = 85;
    let growthProj = 15;
    let riskExposure = 5; // Float in DB

    if (engines.length > 0) {
      macroScore = engines[0].resilienceScore || macroScore;
      growthProj = engines[0].projectedGrowth ? Math.round(engines[0].projectedGrowth * 100) : growthProj;
      riskExposure = engines[0].riskExposure || riskExposure;
    }

    const criticalSuppliersCount = suppliers.filter(s => (s.healthScore || 100) < 50).length;

    return {
      overview: {
        macroResilienceScore: macroScore,
        growthProjection: growthProj,
        riskExposure,
        criticalSuppliers: criticalSuppliersCount,
        activeSuppliers: suppliers.length
      },
      economicScenarios: engines.slice(0, 5).map(e => ({
        id: e.id,
        scenarioType: e.scenarioName,
        impactScore: e.resilienceScore,
        createdAt: e.createdAt
      })),
      supplyChain: suppliers.map(s => ({
        id: s.id,
        businessName: s.targetBusiness?.displayName || 'Unknown Supplier',
        status: s.status,
        healthScore: s.healthScore || 100
      }))
    };
  }
}
