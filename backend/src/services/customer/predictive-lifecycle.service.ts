import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class PredictiveLifecycleService {
  /**
   * Evaluates customer segments, financial velocity, and business goals to generate AI-driven customer lifecycle and retention tracks.
   */
  static async orchestrateLifecycle(businessId: string) {
    // 1. Gather baseline data
    const plans = await prisma.commercialExpansionPlan.findMany({
      where: { businessId },
      include: { segments: true }
    });
    
    const segments = plans.flatMap(p => p.segments);
    
    const financials = await prisma.financialRecord.findMany({
      where: { businessId, type: 'INFLOW', category: 'REVENUE' },
      orderBy: { transactionDate: 'desc' },
      take: 30
    });

    const activeGoals = await prisma.goal.findMany({
      where: { businessId, status: 'ACTIVE' },
      take: 5
    });

    // 2. Format context for AI
    const revenueVelocity = financials.reduce((sum, f) => sum + f.amount, 0);
    
    const orchestrationContext = JSON.stringify({
      customerSegments: segments.map(s => ({
        name: s.name,
        marketSize: s.size || 'Unknown',
        engagementReadiness: s.readiness
      })),
      recentRevenueVelocity: revenueVelocity,
      strategicGoals: activeGoals.map(g => g.title)
    });

    // 3. Prompt Gemini
    const prompt = `
You are AVENIK's Customer Lifecycle & Orchestration AI.
Analyze the following customer segments, revenue velocity, and strategic goals for a business.
Generate a predictive churn analysis and actionable orchestration pathways for these segments.

Customer Context:
${orchestrationContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing the overall customer health and engagement strategy.",
  "overallChurnRisk": number (0-100, where 100 is critical churn risk),
  "segments": [
    {
      "name": "Segment Name",
      "predictedChurnRisk": "HIGH" | "MEDIUM" | "LOW",
      "lifetimeValueTrajectory": "INCREASING" | "STAGNANT" | "DECREASING",
      "recommendedAction": "1 specific retention or up-sell action"
    }
  ],
  "automatedTracks": [
    {
      "trackName": "Name of the engagement campaign/track",
      "targetAudience": "Who this targets",
      "triggerEvent": "What triggers this track (e.g., 30 days inactive, new signup)",
      "expectedConversionLift": "Percentage string, e.g., +15%"
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
      if (!responseText) throw new Error("Empty response from Lifecycle AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Lifecycle Orchestration Failed:", error);
      throw error;
    }
  }
}
