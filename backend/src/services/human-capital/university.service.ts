import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class UniversityService {
  static async analyze(businessId: string) {
    const gaps = await prisma.capabilityGap.findMany({ where: { businessId }, take: 10 });
    const workforce = await prisma.workforceCapacity.findMany({ where: { businessId }, take: 5 });

    const context = JSON.stringify({
      skillGaps: gaps.map(g => ({ skill: g.skillName, deficit: g.requiredLevel - g.currentLevel })),
      roles: workforce.map(w => w.roleName)
    });

    const prompt = `
You are AVENIK's Corporate University AI.
Analyze the current skill gaps and workforce roles.
Generate a dynamic corporate learning and development (L&D) curriculum.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the learning strategy.",
  "workforceReadinessScore": number (0-100),
  "learningTracks": [
    {
      "trackName": "Name of the course/track",
      "targetRole": "Who should take this",
      "skillAddressed": "Which gap this closes",
      "duration": "e.g., 4 weeks"
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
