import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class IntellectualPropertyService {
  static async analyze(businessId: string) {
    const innovations = await prisma.innovationRecord.findMany({ where: { businessId }, take: 10 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      innovations: innovations.map(i => i.title),
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Intellectual Property (IP) AI.
Analyze the business's active innovations and strategic goals.
Generate an IP protection and commercialization strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the IP posture.",
  "protectionScore": number (0-100),
  "assetsToProtect": [
    {
      "asset": "Name of the innovation/asset",
      "protectionType": "PATENT" | "TRADEMARK" | "COPYRIGHT" | "TRADE_SECRET",
      "priority": "URGENT" | "HIGH" | "MEDIUM"
    }
  ],
  "monetizationStrategies": [
    {
      "strategy": "How to monetize the IP (e.g., Licensing)",
      "estimatedImpact": "Expected revenue lift or strategic advantage"
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
