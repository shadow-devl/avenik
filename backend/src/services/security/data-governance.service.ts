import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class DataGovernanceService {
  static async analyze(businessId: string) {
    const trust = await prisma.trustProfile.findUnique({ where: { businessId } });
    const frauds = await prisma.fraudCase.findMany({ where: { businessId }, take: 5 });

    const context = JSON.stringify({
      dataTrustScore: trust?.trustScore || 50,
      dataBreachesOrIncidents: frauds.map(f => f.type)
    });

    const prompt = `
You are AVENIK's Data Governance AI.
Analyze the trust profile and past incidents to determine data compliance readiness.
Generate a data privacy, compliance (GDPR/SOC2), and governance strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the data compliance posture.",
  "complianceReadinessScore": number (0-100),
  "governanceGaps": [
    {
      "gap": "Data vulnerability (e.g., Unencrypted PII)",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "remediationSteps": [
    {
      "action": "What to implement",
      "framework": "e.g., GDPR, SOC2, HIPAA"
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
