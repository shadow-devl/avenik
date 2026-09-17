import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class SupportPortfolioService {
  static async analyze(businessId: string) {
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    const context = JSON.stringify({
      industry: business?.organizationType,
      stage: business?.businessStatus,
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Government Support & Grants AI.
Analyze the business industry, stage, and strategic goals.
Generate an optimal portfolio of government schemes and grants to pursue.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the grant strategy.",
  "portfolioMatchScore": number (0-100),
  "recommendedSchemes": [
    {
      "schemeName": "Name of a relevant government scheme (realistic)",
      "fundingType": "e.g., Grant, Subsidized Loan, Tax Credit",
      "alignment": "Why this aligns with the business goals"
    }
  ],
  "complianceChecklist": [
    {
      "requirement": "What needs to be prepared",
      "status": "PENDING"
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
