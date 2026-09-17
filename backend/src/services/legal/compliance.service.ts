import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class LegalComplianceService {
  static async runAudit(businessId: string) {
    const trustProfile = await prisma.trustProfile.findUnique({ where: { businessId } });
    const frauds = await prisma.fraudCase.findMany({ where: { businessId, status: { not: 'CLOSED' } }, take: 5 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const legalContext = JSON.stringify({
      trustScore: trustProfile?.trustScore || 50,
      openFrauds: frauds.map(f => f.type),
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Legal & Compliance AI.
Analyze the trust profile, open fraud cases, and strategic goals.
Generate a compliance audit and legal action items.

Context:
${legalContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the legal and compliance risk posture.",
  "complianceScore": number (0-100),
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "actionItems": [
    {
      "task": "Specific legal/compliance task",
      "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
      "category": "CONTRACTS" | "IP" | "DATA_PRIVACY" | "FRAUD_MITIGATION" | "CORPORATE"
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
