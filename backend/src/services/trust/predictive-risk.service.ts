import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class PredictiveRiskService {
  /**
   * Evaluates holistic cyber, fraud, and operational risk to generate a comprehensive AI Threat Matrix.
   */
  static async evaluateThreatMatrix(businessId: string) {
    // 1. Gather all active risk signals
    const trustProfile = await prisma.trustProfile.findUnique({
      where: { businessId }
    });

    const activeFrauds = await prisma.fraudCase.findMany({
      where: { businessId, status: { in: ['OPEN', 'INVESTIGATING'] } },
      take: 10
    });

    const anomalies = await prisma.anomalyDetection.findMany({
      where: { businessId, status: 'DETECTED' },
      take: 10
    });

    const operationalRisks = await prisma.operationalRisk.findMany({
      where: { businessId, mitigated: false },
      take: 10
    });

    // 2. Format context for AI
    const riskContext = JSON.stringify({
      trustScore: trustProfile?.trustScore || 50,
      activeFraudCases: activeFrauds.map(f => ({ type: f.type, severity: f.severity, details: f.details })),
      unresolvedAnomalies: anomalies.map(a => ({ type: a.domain, severity: a.severity, metric: a.metric })),
      operationalThreats: operationalRisks.map(r => ({ category: r.riskArea, severity: r.severity }))
    });

    // 3. Prompt Gemini
    const prompt = `
You are AVENIK's Risk & Threat Intelligence Engine.
Analyze the following active risk signals, fraud cases, anomalies, and operational threats for this business.
Calculate an overall Threat Level and provide a prioritized Mitigation Plan.

Risk Context:
${riskContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing the overall security and risk posture.",
  "overallThreatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "threatScore": number (0-100, where 100 is maximum danger),
  "activeThreats": [
    {
      "name": "Short name of threat",
      "category": "CYBER" | "FRAUD" | "OPERATIONAL" | "MARKET",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "description": "1 sentence describing the active threat"
    }
  ],
  "mitigationPlan": [
    {
      "step": number (priority order),
      "action": "Specific action to take",
      "estimatedImpact": "What this will resolve"
    }
  ]
}
`.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from Risk AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Threat Matrix Generation Failed:", error);
      throw error;
    }
  }
}
