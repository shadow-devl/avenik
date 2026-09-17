import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class ForecastingIntelligenceService {
  static async predict(businessId: string) {
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });
    const financials = await prisma.financialRecord.findMany({ 
      where: { businessId }, 
      orderBy: { transactionDate: 'desc' }, 
      take: 40 
    });

    const inflowVelocity = financials.filter(f => f.type === 'INFLOW').reduce((sum, f) => sum + f.amount, 0);
    const outflowVelocity = financials.filter(f => f.type === 'OUTFLOW').reduce((sum, f) => sum + f.amount, 0);

    const context = JSON.stringify({
      strategicGoals: goals.map(g => g.title),
      currentQuarterInflow: inflowVelocity,
      currentQuarterOutflow: outflowVelocity
    });

    const prompt = `
You are AVENIK's Forecasting Intelligence AI.
Analyze the current quarterly financial velocity and strategic goals.
Generate a deterministic 3-quarter financial forecast and scenario analysis.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the forecasting trajectory.",
  "projectedRunwayMonths": number,
  "quarters": [
    {
      "quarter": "Q1",
      "projectedRevenue": number,
      "projectedBurn": number,
      "keyDriver": "What drives this outcome"
    }
  ],
  "scenarios": [
    {
      "scenarioType": "BEST_CASE" | "WORST_CASE" | "BASE_CASE",
      "trigger": "What would cause this scenario",
      "mitigation": "How to handle it"
    }
  ]
}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.3 }
    });
    return JSON.parse(response.text!);
  }
}
