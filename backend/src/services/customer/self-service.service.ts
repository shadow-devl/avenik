import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class SelfServicePortalService {
  static async analyze(businessId: string) {
    const segments = await prisma.customerSegment.findMany({ where: { plan: { businessId } }, take: 5 });
    const frauds = await prisma.fraudCase.findMany({ where: { businessId }, take: 5 });

    const context = JSON.stringify({
      customerSegments: segments.map(s => s.name),
      commonFrictionPoints: frauds.map(f => f.type) // Using fraud as proxy for friction
    });

    const prompt = `
You are AVENIK's Customer Self-Service AI.
Analyze the customer segments and friction points.
Generate a strategy for a self-service portal to deflect support tickets.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the self-service strategy.",
  "deflectionPotentialScore": number (0-100),
  "automationPlays": [
    {
      "play": "Specific automation or portal feature (e.g., Automated Refund UI)",
      "targetSegment": "Which segment this helps most"
    }
  ],
  "faqGeneration": [
    {
      "question": "High-volume customer question",
      "answer": "Suggested AI-generated answer"
    }
  ]
}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.4 }
    });
    return JSON.parse(response.text!);
  }
}
