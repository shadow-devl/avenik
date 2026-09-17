import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class CustomerExperienceService {
  static async analyze(businessId: string) {
    const segments = await prisma.customerSegment.findMany({ where: { plan: { businessId } }, take: 10 });
    const frauds = await prisma.fraudCase.findMany({ where: { businessId }, take: 5 }); // Use as proxy for friction

    const context = JSON.stringify({
      customerSegments: segments.map(s => ({ name: s.name, readiness: s.readiness })),
      frictionPoints: frauds.map(f => f.type)
    });

    const prompt = `
You are AVENIK's Customer Experience AI.
Analyze the customer segments and friction points.
Generate an actionable Customer Experience (CX) strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the CX posture.",
  "cxHealthScore": number (0-100),
  "frictionPoints": [
    {
      "journeyStage": "Stage of customer journey",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "resolution": "How to resolve this friction"
    }
  ],
  "loyaltyInitiatives": [
    {
      "initiative": "Name of the initiative",
      "targetSegment": "Which segment this targets",
      "expectedLift": "e.g., +20% retention"
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
