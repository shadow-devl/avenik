import { prisma } from '../../db.js';

export class ResourceIntelligenceService {
  static async getMetrics(businessId: string) {
    const suppliers = await prisma.ecosystemRelationship.findMany({
      where: {
        sourceBusinessId: businessId,
        relationshipType: 'B2B_SUPPLIER'
      },
      include: {
        targetBusiness: true
      },
      orderBy: { healthScore: 'desc' }
    });

    const scenarios = await prisma.economicEngine.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    let activeSuppliers = 0;
    let totalSupplierHealth = 0;
    let criticalSuppliers = 0;

    suppliers.forEach(s => {
      if (s.status === 'ACTIVE' || s.status === 'CONSENTED') activeSuppliers++;
      if (s.healthScore != null) {
        totalSupplierHealth += s.healthScore;
      }
      if (s.healthScore != null && s.healthScore < 50) criticalSuppliers++;
    });

    const supplierHealthAvg = suppliers.length > 0 ? Math.round(totalSupplierHealth / suppliers.length) : 0;
    const macroResilience = scenarios.length > 0 ? Math.round(scenarios[0].resilienceScore * 100) : 75;

    return {
      overview: {
        activeSuppliers,
        supplierHealthAvg,
        criticalSuppliers,
        macroResilience
      },
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.targetBusiness?.businessName || 'Unknown Supplier',
        status: s.status,
        health: s.healthScore,
        lastUpdated: s.updatedAt
      })).slice(0, 10),
      macroScenarios: scenarios.map(s => ({
        id: s.id,
        name: s.scenarioName,
        growth: s.projectedGrowth,
        risk: s.riskExposure,
        resilience: Math.round(s.resilienceScore * 100),
        factors: s.macroFactors
      })).slice(0, 3)
    };
  }
}
