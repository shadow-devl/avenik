import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class ESGService {
  static async analyzeSustainability(businessId: string) {
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 10 });
    const financials = await prisma.financialRecord.findMany({ 
      where: { businessId, type: 'OUTFLOW' }, 
      orderBy: { transactionDate: 'desc' }, 
      take: 20 
    });

    const esgContext = JSON.stringify({
      strategicGoals: goals.map(g => g.title),
      recentExpenditures: financials.map(f => ({ category: f.category, amount: f.amount }))
    });

    const prompt = `
You are AVENIK's ESG & Sustainability AI.
Analyze the business goals and recent expenditures.
Calculate an ESG Score and provide actionable sustainability initiatives.

Context:
${esgContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the ESG posture.",
  "esgScore": number (0-100),
  "carbonFootprintEstimate": "String e.g., 'Medium-High' or 'Low'",
  "initiatives": [
    {
      "title": "Initiative name",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "costEstimate": "String e.g., 'Low Cost' or 'High Investment'",
      "description": "1 sentence description"
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
