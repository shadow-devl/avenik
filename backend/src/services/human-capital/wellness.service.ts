import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class WellnessService {
  static async analyze(businessId: string) {
    const risks = await prisma.operationalRisk.findMany({ where: { businessId, mitigated: false }, take: 10 });
    
    // Proxy for burnout: High operational risks + overloaded workforce
    const context = JSON.stringify({
      stressIndicators: risks.map(r => r.riskArea),
      recentChallenges: risks.map(r => r.severity)
    });

    const prompt = `
You are AVENIK's Corporate Wellness AI.
Analyze the current operational stress indicators and organizational challenges.
Generate a corporate wellness and retention strategy to prevent burnout.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the employee wellbeing posture.",
  "wellnessScore": number (0-100),
  "burnoutRisks": [
    {
      "trigger": "What is causing stress (e.g., Heavy operational load)",
      "severity": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "interventions": [
    {
      "initiative": "Name of the wellness program",
      "impact": "Expected outcome on retention/health"
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
