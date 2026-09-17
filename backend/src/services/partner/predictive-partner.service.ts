import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class PredictivePartnerService {
  /**
   * Generates intelligent B2B partner matches by analyzing capability gaps and strategic goals.
   */
  static async evaluateEcosystemMatches(businessId: string) {
    // 1. Gather baseline data
    const capabilityGaps = await prisma.capabilityGap.findMany({
      where: { businessId },
      take: 10
    });

    const activeGoals = await prisma.goal.findMany({
      where: { businessId, status: 'ACTIVE' },
      take: 5
    });

    // 2. Format context for AI
    const partnerContext = JSON.stringify({
      identifiedGaps: capabilityGaps.map(g => ({
        skillName: g.skillName,
        gapSize: g.requiredLevel - g.currentLevel
      })),
      strategicGoals: activeGoals.map(g => g.title)
    });

    // 3. Prompt Gemini
    const prompt = `
You are AVENIK's Ecosystem & Partner Intelligence AI.
Analyze the following capability gaps and strategic goals for a business.
Recommend 3 specific categories of B2B partners, suppliers, or vendors they need to fill these gaps.

Business Context:
${partnerContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the overarching partnership strategy.",
  "ecosystemReadinessScore": number (0-100, based on how badly they need partners to achieve goals),
  "recommendedPartners": [
    {
      "partnerType": "Type of B2B Partner (e.g. 3PL Logistics, Custom Software Dev, Tax Advisory)",
      "gapAddressed": "Which gap this fills",
      "expectedValue": "HIGH" | "MEDIUM" | "LOW",
      "searchCriteria": "What specific keywords or attributes to look for in this partner"
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
          temperature: 0.3
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from Partner AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Partner Engine Failed:", error);
      throw error;
    }
  }
}
