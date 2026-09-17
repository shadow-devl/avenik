import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class InternationalizationService {
  static async analyze(businessId: string) {
    const expansionPlans = await prisma.commercialExpansionPlan.findMany({ where: { businessId }, take: 5 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      targetMarkets: expansionPlans.map(p => p.targetMarket),
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Internationalization AI.
Analyze the commercial expansion target markets and strategic goals.
Generate a global market entry and internationalization strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the global expansion readiness.",
  "readinessScore": number (0-100),
  "marketEntryPlays": [
    {
      "market": "Target region or country",
      "modeOfEntry": "e.g., Joint Venture, Direct Export, Subsidiary",
      "rationale": "Why this mode fits"
    }
  ],
  "localizationNeeds": [
    {
      "category": "e.g., Legal, Cultural, Product",
      "requirement": "What needs to be adapted"
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
