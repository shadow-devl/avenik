import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class SchemeSuccessService {
  static async analyze(businessId: string) {
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });
    const financials = await prisma.financialRecord.findMany({ where: { businessId, category: 'OPERATIONS', type: 'OUTFLOW' }, take: 10 });

    const context = JSON.stringify({
      strategicGoals: goals.map(g => g.title),
      burnRateIndicator: financials.length > 0 ? "Active Spend" : "Low Spend"
    });

    const prompt = `
You are AVENIK's Government Scheme Success AI.
Analyze the strategic goals and financial burn indicators.
Generate an application narrative and success probability for a generic grant application.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing application strength.",
  "probabilityOfSuccessScore": number (0-100),
  "narrativeAngles": [
    {
      "angle": "How to pitch the business to the government (e.g., Job Creator)",
      "justification": "Why this angle works based on context"
    }
  ],
  "weaknesses": [
    {
      "weakness": "Potential red flag in application",
      "mitigation": "How to address it in the pitch"
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
