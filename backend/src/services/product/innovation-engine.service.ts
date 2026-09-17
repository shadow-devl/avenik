import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class InnovationEngineService {
  /**
   * Evaluates current innovation records and strategic goals to suggest new product pipelines and validate hypotheses.
   */
  static async evaluatePipeline(businessId: string) {
    // 1. Gather baseline data
    const innovations = await prisma.innovationRecord.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const activeGoals = await prisma.goal.findMany({
      where: { businessId, status: 'ACTIVE' },
      take: 5
    });

    // 2. Format context for AI
    const innovationContext = JSON.stringify({
      currentPortfolio: innovations.map(i => ({
        title: i.title,
        type: i.type,
        status: i.status,
        hypothesis: i.hypothesis,
        learning: i.learning
      })),
      strategicGoals: activeGoals.map(g => g.title)
    });

    // 3. Prompt Gemini
    const prompt = `
You are AVENIK's Product Innovation AI.
Analyze the following product innovation portfolio (ideas, experiments, patents) and strategic goals for a business.
Generate an actionable innovation strategy, identify market gaps, and score the pipeline health.

Innovation Context:
${innovationContext}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing the product innovation health.",
  "pipelineHealthScore": number (0-100),
  "marketGaps": [
    {
      "gapName": "Name of the market gap/opportunity",
      "description": "Why this is an opportunity based on goals/current portfolio",
      "potentialImpact": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "recommendedPipelines": [
    {
      "productConcept": "Name of new product/feature to build",
      "rationale": "Why this fits the strategy",
      "validationStep": "Next step to validate this idea"
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
      if (!responseText) throw new Error("Empty response from Innovation AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Innovation Engine Failed:", error);
      throw error;
    }
  }
}
