import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class AdvancedSupplierService {
  static async analyze(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, riskArea: 'SUPPLY_CHAIN', mitigated: false }, take: 10 });
    const financials = await prisma.financialRecord.findMany({ where: { businessId, category: 'OPERATIONS', type: 'OUTFLOW' }, take: 10 });

    const context = JSON.stringify({
      supplyChainRisks: risks.map(r => ({ risk: r.riskArea, severity: r.severity })),
      recentVendorSpendCount: financials.length
    });

    const prompt = `
You are AVENIK's Advanced Supplier & Vendor AI.
Analyze supply chain risks and operations spend frequency.
Generate a supplier optimization and risk mitigation strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining supplier health.",
  "supplyChainResilienceScore": number (0-100),
  "vendorRisks": [
    {
      "riskFactor": "What is putting the supply chain at risk",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "mitigation": "How to fix it"
    }
  ],
  "costOptimizations": [
    {
      "strategy": "Vendor negotiation or consolidation strategy",
      "estimatedSavings": "String e.g., '10-15% reduction in COGS'"
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
