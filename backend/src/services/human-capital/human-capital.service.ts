import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class HumanCapitalService {
  static async analyze(businessId: string) {
    const workforce = await prisma.workforceCapacity.findMany({ where: { businessId }, take: 10 });
    const gaps = await prisma.capabilityGap.findMany({ where: { businessId }, take: 10 });
    const goals = await prisma.goal.findMany({ where: { businessId, status: 'ACTIVE' }, take: 5 });

    const context = JSON.stringify({
      workforceRoles: workforce.map(w => ({ role: w.roleName, headcount: w.currentFTE })),
      capabilityGaps: gaps.map(g => ({ skill: g.skillName, gap: g.requiredLevel - g.currentLevel })),
      strategicGoals: goals.map(g => g.title)
    });

    const prompt = `
You are AVENIK's Human Capital Intelligence AI.
Analyze the workforce roles, capability gaps, and strategic goals.
Generate a talent map and hiring strategy.

Context:
${context}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the talent posture.",
  "talentHealthScore": number (0-100),
  "criticalHires": [
    {
      "role": "Role to hire",
      "urgency": "HIGH" | "MEDIUM" | "LOW",
      "reason": "Why this is needed based on goals/gaps"
    }
  ],
  "upskillingTracks": [
    {
      "targetGroup": "Who to train",
      "focusArea": "What skill to focus on",
      "impact": "Expected outcome"
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
