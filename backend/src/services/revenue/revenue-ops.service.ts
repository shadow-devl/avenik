import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class RevenueOperationsService {
  static async analyze(businessId: string) {
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 10 });
    const inflows = await prisma.financialRecord.findMany({ 
      where: { businessId, type: 'INFLOW', category: 'REVENUE' }, 
      orderBy: { transactionDate: 'desc' }, 
      take: 30 
    });

    const context = JSON.stringify({
      strategicGoals: goals.map(g => g.title),
      revenueVelocity: inflows.reduce((sum, f) => sum + f.amount, 0),
      recentDealsCount: inflows.length
    });

    const prompt = `
You are AVENIK's Revenue Operations AI.
Analyze the revenue velocity, deal volume, and strategic goals.
Generate a RevOps strategy to stop leakage and accelerate pipeline velocity.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the revenue posture.",
  "pipelineVelocityScore": number (0-100),
  "revenueLeakagePoints": [
    {
      "stage": "Where leakage happens",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "fix": "How to plug the leak"
    }
  ],
  "accelerationPlays": [
    {
      "play": "Name of the sales/RevOps play",
      "expectedLift": "e.g., +15% win rate"
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
