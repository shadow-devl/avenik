import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class MarketingIntelligenceService {
  static async analyze(businessId: string) {
    const segments = await prisma.customerSegment.findMany({ where: { plan: { businessId } }, take: 5 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      targetDemographics: segments.map(s => s.name),
      businessGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Marketing Intelligence AI.
Analyze the target customer segments against the active business goals.
Generate a high-conversion marketing strategy and campaign plays.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the marketing angle.",
  "brandResonanceScore": number (0-100),
  "campaignPlays": [
    {
      "campaignName": "Catchy name for the campaign",
      "targetSegment": "Which demographic this hits",
      "coreMessage": "The main value proposition/hook"
    }
  ],
  "channelOptimizations": [
    {
      "channel": "e.g., LinkedIn, TikTok, SEO",
      "tactic": "Specific growth hack or strategy"
    }
  ]
}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.5 }
    });
    return JSON.parse(response.text!);
  }
}
