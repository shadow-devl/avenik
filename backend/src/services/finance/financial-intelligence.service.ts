import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class FinancialIntelligenceService {
  static async analyze(businessId: string) {
    const inflows = await prisma.financialRecord.findMany({ where: { businessId, type: 'INFLOW' }, take: 10 });
    const outflows = await prisma.financialRecord.findMany({ where: { businessId, type: 'OUTFLOW' }, take: 10 });

    const totalInflow = inflows.reduce((acc, r) => acc + r.amount, 0);
    const totalOutflow = outflows.reduce((acc, r) => acc + r.amount, 0);

    const context = JSON.stringify({
      inflowVolume: totalInflow,
      outflowVolume: totalOutflow,
      revenueStreams: inflows.map(i => i.category)
    });

    const prompt = `
You are AVENIK's Financial Intelligence AI.
Analyze the raw financial volume and revenue streams.
Generate a comprehensive financial health and margin optimization report.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing financial health.",
  "financialHealthScore": number (0-100),
  "marginOptimizations": [
    {
      "area": "Where to cut costs or raise prices",
      "strategy": "Specific financial tactic",
      "impact": "Expected margin expansion"
    }
  ],
  "anomaliesDetected": [
    {
      "description": "Potential financial risk or unusual pattern",
      "severity": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.2 }
    });
    return JSON.parse(response.text!);
  }
}
