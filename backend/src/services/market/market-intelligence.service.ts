import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class MarketIntelligenceService {
  static async analyze(businessId: string) {
    const plans = await prisma.commercialExpansionPlan.findMany({ where: { businessId }, include: { segments: true }, take: 3 });
    const innovations = await prisma.innovationRecord.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      expansionPlans: plans.map(p => ({ market: p.targetMarket, segments: p.segments.map(s => s.name) })),
      activeInnovations: innovations.map(i => i.title)
    });

    const prompt = `
You are AVENIK's Market Intelligence AI.
Analyze the target markets, customer segments, and active product innovations.
Generate a competitive landscape and market positioning strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the market positioning.",
  "marketOpportunityScore": number (0-100),
  "competitorThreats": [
    {
      "threatType": "Type of competitive threat (e.g., Price War, Feature Parity)",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "mitigation": "How to defend against it"
    }
  ],
  "growthVectors": [
    {
      "vector": "Where to expand next",
      "rationale": "Why this aligns with current innovations and markets"
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
