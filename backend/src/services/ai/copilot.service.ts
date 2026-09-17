import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class CopilotService {
  static async chat(businessId: string, message: string) {
    // 1. Gather context to ground the AI
    const health = await prisma.businessHealth.findFirst({ where: { businessId }, orderBy: { calculatedAt: 'desc' } });
    const activeSignals = await prisma.intelligenceSignal.findMany({ where: { businessId }, take: 3, orderBy: { createdAt: 'desc' } });

    const systemPrompt = `
You are the AVENIK Copilot, an elite strategic advisor for entrepreneurs.
You have direct access to the user's business intelligence telemetry.
Current Health Score: ${health?.score || 'N/A'}/100.
Recent Active Signals:
${activeSignals.map(s => `- [${s.signalType}] ${s.title} (Impact: ${s.impact})`).join('\n') || 'None'}

Your job is to answer the user's query concisely, using a highly professional, strategic tone.
Do not hallucinate data. If you don't know something, advise them to check their dashboard modules.
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Query: " + message }] }
        ],
        config: {
          temperature: 0.7
        }
      });

      return {
        reply: response.text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Copilot Chat Failed:", error);
      throw error;
    }
  }
}
