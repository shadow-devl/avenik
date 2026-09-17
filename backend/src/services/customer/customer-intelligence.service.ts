import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerIntelligenceService {
  static async getCustomerMetrics(businessId: string) {
    const plans = await prisma.commercialExpansionPlan.findMany({
      where: { businessId },
      include: {
        segments: true
      }
    });

    const segments = plans.flatMap(p => p.segments);
    
    let totalCustomers = 0;
    let avgClv = 0;
    let churnRisk = 0;
    
    if (segments.length === 0) {
      return {
        totalCustomers: 0,
        averageCLV: 0,
        churnRiskScore: 0,
        segments: [],
        status: "NO_DATA"
      };
    }

    segments.forEach(seg => {
      totalCustomers += (seg.size || 0);
      if (seg.readiness === 'LOW') {
        churnRisk += 20; 
      } else if (seg.readiness === 'HIGH') {
        avgClv += 5000;
      }
    });

    if (segments.length > 0) {
      avgClv = avgClv / segments.length;
      churnRisk = Math.min(100, churnRisk / segments.length);
    }

    return {
      totalCustomers,
      averageCLV: avgClv,
      churnRiskScore: churnRisk,
      segments: segments.map(s => ({
        id: s.id,
        name: s.name,
        size: s.size,
        readiness: s.readiness
      })),
      status: "ACTIVE"
    };
  }
}
