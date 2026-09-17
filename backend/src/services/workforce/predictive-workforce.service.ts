import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class PredictiveWorkforceService {
  /**
   * Predicts future workforce requirements based on financial growth, 
   * existing team capacity, and active strategic goals.
   */
  static async generateForecast(businessId: string, horizonMonths: number = 6) {
    // 1. Gather baseline data
    const capacities = await prisma.workforceCapacity.findMany({ 
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const goals = await prisma.goal.findMany({ 
      where: { businessId, status: 'ACTIVE' },
      take: 5
    });

    const financials = await prisma.financialRecord.findMany({
      where: { businessId },
      orderBy: { transactionDate: 'desc' },
      take: 50
    });

    // Calculate MRR or Revenue velocity simply for context
    const recentRevenue = financials
      .filter(f => f.category === 'REVENUE' || f.type === 'INFLOW')
      .reduce((sum, f) => sum + f.amount, 0);

    const contextStr = JSON.stringify({
      currentWorkforce: capacities.map(c => ({ role: c.roleName, currentFTE: c.currentFTE, overloaded: c.overloaded })),
      strategicGoals: goals.map(g => g.title),
      financialContext: { recentInflowVolume: recentRevenue, recordCount: financials.length },
      forecastHorizonMonths: horizonMonths
    });

    const prompt = `
You are AVENIK's Predictive Workforce AI.
Analyze the following business context and predict the hiring needs for the next ${horizonMonths} months.

Business Data:
${contextStr}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the overall workforce growth trajectory.",
  "predictions": [
    {
      "role": "Name of the role",
      "currentFTE": 1,
      "predictedFTE": 3,
      "urgency": "HIGH",
      "reasoning": "1 sentence explanation based on the goals and financials"
    }
  ],
  "riskFactors": [
    "String describing a potential hiring or operational risk."
  ]
}
`.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Workforce Forecast Failed:", error);
      throw error;
    }
  }
}
