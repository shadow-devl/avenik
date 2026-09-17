import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class ProductionHubService {
  static async optimizeProduction(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, mitigated: false }, take: 10 });
    const financials = await prisma.financialRecord.findMany({ 
      where: { businessId, category: 'OPERATIONS' }, 
      take: 15 
    });

    const prodContext = JSON.stringify({
      operationalRisks: risks.map(r => ({ area: r.riskArea, severity: r.severity })),
      operationsSpend: financials.reduce((sum, f) => sum + f.amount, 0)
    });

    const prompt = `
You are AVENIK's Production & Supply Chain AI.
Analyze operational risks and operations spend.
Identify bottlenecks and supply chain optimizations.

Context:
${prodContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining production efficiency.",
  "efficiencyScore": number (0-100),
  "bottlenecks": [
    {
      "area": "Where the bottleneck is",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "solution": "Actionable solution"
    }
  ],
  "optimizations": [
    {
      "strategy": "Optimization strategy",
      "estimatedSavings": "String e.g., '10-15% cost reduction'"
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
