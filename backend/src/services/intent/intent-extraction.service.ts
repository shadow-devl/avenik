import { prisma } from '../../db.js';
import { EntrepreneurIntent } from '@prisma/client';

export class IntentExtractionService {
  /**
   * Extracts structured intent from a natural language query using heuristics.
   * In a future update, this can be swapped with an LLM extraction pass.
   */
  static async extractAndSave(businessId: string, query: string): Promise<EntrepreneurIntent> {
    const q = query.toLowerCase();

    // 1. Keyword-based heuristic extraction
    let sector = null;
    if (q.includes('agriculture') || q.includes('farm')) sector = 'AGRICULTURE';
    else if (q.includes('tech') || q.includes('software')) sector = 'TECHNOLOGY';
    else if (q.includes('manufactur') || q.includes('handicraft')) sector = 'MANUFACTURING';
    else if (q.includes('retail') || q.includes('shop')) sector = 'RETAIL';

    let supportNeed = null;
    if (q.includes('loan') || q.includes('capital') || q.includes('credit')) supportNeed = 'LOAN';
    else if (q.includes('grant') || q.includes('free money')) supportNeed = 'GRANT';
    else if (q.includes('subsidy')) supportNeed = 'SUBSIDY';
    else if (q.includes('train') || q.includes('learn') || q.includes('skill')) supportNeed = 'TRAINING';

    let entrepreneurCategory = null;
    if (q.includes('women') || q.includes('woman') || q.includes('female')) entrepreneurCategory = 'WOMAN';
    else if (q.includes('sc') || q.includes('st') || q.includes('dalit') || q.includes('tribal')) entrepreneurCategory = 'SC_ST';
    else if (q.includes('minority')) entrepreneurCategory = 'MINORITY';

    let businessStage = null;
    if (q.includes('idea') || q.includes('start') || q.includes('new')) businessStage = 'IDEA';
    else if (q.includes('grow') || q.includes('scale') || q.includes('expand')) businessStage = 'GROWTH';

    // 2. Save the AI inferred intent (this tags it AI_INFERRED so the UI knows to ask the user to confirm)
    return await prisma.entrepreneurIntent.create({
      data: {
        businessId,
        rawQuery: query,
        sector,
        supportNeed,
        entrepreneurCategory,
        businessStage,
        confirmationStatus: 'AI_INFERRED'
      }
    });
  }

  static async confirmIntent(intentId: string, verifiedData: Partial<EntrepreneurIntent>): Promise<EntrepreneurIntent> {
    return await prisma.entrepreneurIntent.update({
      where: { id: intentId },
      data: {
        ...verifiedData,
        confirmationStatus: 'USER_CONFIRMED'
      }
    });
  }
}
