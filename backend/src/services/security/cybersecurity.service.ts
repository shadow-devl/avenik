import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class CybersecurityService {
  static async analyze(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, mitigated: false }, take: 10 });
    const frauds = await prisma.fraudCase.findMany({ where: { businessId }, take: 5 });

    const context = JSON.stringify({
      operationalRisks: risks.map(r => ({ area: r.riskArea, severity: r.severity })),
      fraudIncidents: frauds.map(f => f.type)
    });

    const prompt = `
You are AVENIK's Cybersecurity & Threat AI.
Analyze the business's operational risks and fraud incidents.
Generate a comprehensive cybersecurity posture report.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the security posture.",
  "securityScore": number (0-100),
  "threatVectors": [
    {
      "vector": "Specific threat type (e.g., Phishing, Data Breach)",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "mitigation": "How to secure against this"
    }
  ],
  "infrastructureUpgrades": [
    {
      "upgrade": "Name of the security tool or protocol",
      "impact": "Expected risk reduction"
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
