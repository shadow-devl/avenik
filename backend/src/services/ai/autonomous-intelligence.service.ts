import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class AutonomousIntelligenceService {
  static async triggerSignalGeneration(businessId: string) {
    // 1. Gather context
    const financials = await prisma.financialRecord.findMany({ where: { businessId }, take: 10, orderBy: { transactionDate: 'desc' } });
    const health = await prisma.businessHealth.findFirst({ where: { businessId }, orderBy: { calculatedAt: 'desc' } });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    // 2. Build prompt context
    const contextStr = JSON.stringify({
      businessHealthScore: health?.score || 'Unknown',
      recentFinancials: financials.map(f => ({ type: f.type, amount: f.amount, category: f.category })),
      activeGoals: goals.map(g => ({ title: g.title, progress: g.progress }))
    });

    const prompt = `
You are an advanced AI business analyst for the AVENIK platform.
Analyze the following raw business data and generate exactly 3 intelligence signals.
Each signal must identify a clear RISK, OPPORTUNITY, or BOTTLENECK.

Business Context:
${contextStr}

Respond ONLY with a valid JSON array of objects, where each object has these exact fields:
- domain: "FINANCE", "OPERATIONS", "MARKET", or "RISK"
- signalType: "RISK", "OPPORTUNITY", or "BOTTLENECK"
- title: A concise, punchy title (max 60 chars)
- description: 1-2 sentences explaining the insight
- impact: "HIGH", "MEDIUM", or "LOW"
- urgency: "IMMEDIATE", "HIGH", or "MEDIUM"
- confidence: A float between 0.5 and 0.99
    `.trim();

    try {
      // 3. Call Gemini
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from AI");

      const signals = JSON.parse(responseText);

      // 4. Save to Database
      const savedSignals = [];
      for (const sig of signals) {
        const created = await prisma.intelligenceSignal.create({
          data: {
            businessId,
            domain: sig.domain,
            signalType: sig.signalType,
            title: sig.title,
            description: sig.description,
            impact: sig.impact,
            urgency: sig.urgency,
            confidence: sig.confidence,
            evidence: [] // Empty JSON for now
          }
        });
        savedSignals.push(created);
      }

      return savedSignals;

    } catch (error) {
      console.error("AI Signal Generation Failed:", error);
      throw error;
    }
  }
}
