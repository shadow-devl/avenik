import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class OpportunityExecutionService {
  static async analyze(businessId: string) {
    const innovations = await prisma.innovationRecord.findMany({ where: { businessId }, take: 10 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      productAssets: innovations.map(i => i.title),
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Ecosystem Opportunity AI.
Analyze the current product assets and strategic goals.
Generate a partnership and ecosystem execution strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the partnership strategy.",
  "ecosystemReadinessScore": number (0-100),
  "jointVentures": [
    {
      "opportunity": "Name of the proposed Joint Venture or partnership",
      "targetPartnerProfile": "e.g., Enterprise SaaS, Regional Distributor",
      "expectedSynergy": "Why this creates value"
    }
  ],
  "executionSteps": [
    {
      "step": "Specific tactical action to secure the partnership",
      "timeline": "e.g., 30 Days"
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
