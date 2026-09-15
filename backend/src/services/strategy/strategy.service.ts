import { prisma } from '../../db.js';

export class StrategyService {
  /**
   * Generates growth scenarios
   */
  static async generateGrowthScenario(businessId: string, scenarioName: string, projectedRevenue: number, probability: number = 0.5) {
    const scenario = await prisma.growthScenario.create({
      data: {
        businessId,
        scenarioName,
        projectedRevenue,
        probability
      }
    });

    const expectedValue = projectedRevenue * probability;

    return {
      scenario,
      expectedValue,
      insight: expectedValue > 1000000 
        ? 'High impact scenario. Prioritize execution.' 
        : 'Moderate impact scenario.'
    };
  }
}
