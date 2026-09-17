import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class IdeationService {
  static async generate(businessId: string) {
    const innovations = await prisma.innovationRecord.findMany({ where: { businessId }, take: 10 });
    const segments = await prisma.customerSegment.findMany({ where: { plan: { businessId } }, take: 5 });

    const context = JSON.stringify({
      currentInnovations: innovations.map(i => i.title),
      targetSegments: segments.map(s => s.name)
    });

    const prompt = `
You are AVENIK's Ideation & Product Strategy AI.
Analyze the current product portfolio and target customer segments.
Brainstorm 3 high-impact, novel product or service ideas.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences summarizing the innovation vector.",
  "innovationScore": number (0-100),
  "ideas": [
    {
      "title": "Name of the concept",
      "description": "1-2 sentence description",
      "targetSegment": "Which segment this appeals to",
      "feasibility": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.7 } // Higher temp for creativity
    });
    return JSON.parse(response.text!);
  }
}
