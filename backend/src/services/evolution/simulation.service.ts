import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Strategic Simulation & Decision Intelligence
 */
export class SimulationService {
  /**
   * Create a strategic simulation.
   */
  static async create(businessId: string, data: {
    title: string; description?: string; scenarioType: string;
    assumptions?: any[]; variables?: Record<string, any>;
  }) {
    return prisma.strategicSimulation.create({
      data: {
        businessId,
        title: data.title,
        description: data.description,
        scenarioType: data.scenarioType,
        assumptions: data.assumptions || [],
        variables: data.variables || {},
      },
    });
  }

  /**
   * Run simulation and generate projections.
   */
  static async runSimulation(id: string) {
    const sim = await prisma.strategicSimulation.findUnique({ where: { id } });
    if (!sim) throw new Error('Simulation not found');

    const vars = sim.variables as Record<string, any>;
    const baseRevenue = vars.revenue || 100000;
    const growthRate = vars.growthRate || 0.1;
    const costRatio = vars.costRatio || 0.6;

    const multiplier = sim.scenarioType === 'UPSIDE' ? 1.3
      : sim.scenarioType === 'DOWNSIDE' ? 0.7
      : sim.scenarioType === 'STRESS' ? 0.5
      : 1.0;

    const projections = {
      revenue: Array.from({ length: 4 }, (_, i) => ({
        quarter: `Q${i + 1}`,
        value: Math.round(baseRevenue * Math.pow(1 + growthRate * multiplier, i + 1)),
      })),
      costs: Array.from({ length: 4 }, (_, i) => ({
        quarter: `Q${i + 1}`,
        value: Math.round(baseRevenue * costRatio * Math.pow(1 + growthRate * multiplier * 0.8, i + 1)),
      })),
      cashPosition: Math.round(baseRevenue * (1 - costRatio) * 4 * multiplier),
      breakEvenMonth: Math.max(1, Math.round(12 / (growthRate * multiplier * 10 + 1))),
    };

    const tradeOffs = [
      { option: 'Aggressive Growth', risk: 'Higher burn, shorter runway', reward: 'Faster market capture' },
      { option: 'Conservative', risk: 'Slower growth', reward: 'Longer runway, lower risk' },
    ];

    return prisma.strategicSimulation.update({
      where: { id },
      data: { projections, tradeOffs, status: 'COMPLETED' },
    });
  }

  /**
   * Get simulations for a business.
   */
  static async getSimulations(businessId: string, filters?: { scenarioType?: string }) {
    return prisma.strategicSimulation.findMany({
      where: {
        businessId,
        ...(filters?.scenarioType && { scenarioType: filters.scenarioType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Compare multiple simulations side-by-side.
   */
  static async compareSimulations(simulationIds: string[]) {
    const simulations = await prisma.strategicSimulation.findMany({
      where: { id: { in: simulationIds } },
    });

    return simulations.map(s => ({
      id: s.id,
      title: s.title,
      scenarioType: s.scenarioType,
      projections: s.projections,
      tradeOffs: s.tradeOffs,
      status: s.status,
    }));
  }
}
