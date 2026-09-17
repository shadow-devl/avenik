import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class OperationsIntelligenceService {
  static async analyze(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, mitigated: false }, take: 10 });
    const financials = await prisma.financialRecord.findMany({ where: { businessId, category: 'OPERATIONS' }, take: 10 });
    
    const context = JSON.stringify({
      operationalRisks: risks.map(r => ({ riskArea: r.riskArea, severity: r.severity })),
      operationsSpendCount: financials.length
    });

    const prompt = `
You are AVENIK's Operations Intelligence AI.
Analyze the operational risks and operations spend activity.
Generate a day-to-day workflow telemetry report.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the operational workflow efficiency.",
  "workflowEfficiencyScore": number (0-100),
  "processBottlenecks": [
    {
      "process": "Name of the workflow process",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "automationPotential": "How to automate this"
    }
  ],
  "resourceAllocations": [
    {
      "resource": "What resource to reallocate",
      "action": "Where to put it for better efficiency"
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
