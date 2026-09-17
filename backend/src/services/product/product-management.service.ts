import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class ProductManagementService {
  static async analyze(businessId: string) {
    const innovations = await prisma.innovationRecord.findMany({ where: { businessId }, take: 10 });
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, riskArea: 'PRODUCT', mitigated: false }, take: 5 });

    const context = JSON.stringify({
      activeProducts: innovations.map(i => i.title),
      productRisks: risks.map(r => r.severity)
    });

    const prompt = `
You are AVENIK's Product Management AI.
Analyze the current product innovation portfolio and active product risks.
Generate a product roadmap optimization strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the product health.",
  "productVelocityScore": number (0-100),
  "backlogPriorities": [
    {
      "feature": "Suggested feature or fix",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM",
      "businessValue": "Why we should build this"
    }
  ],
  "lifecycleAdjustments": [
    {
      "product": "Name of an active product from context",
      "action": "e.g., Scale, Sun-set, Refactor"
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
