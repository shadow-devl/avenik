import { EntrepreneurIntent, Business } from '@prisma/client';
import { ScoredOpportunity } from '../search/hybrid-search.service.js';

export interface EligibilityResult {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INSUFFICIENT_INFORMATION';
  reasons: string[];
  missingInfo: string[];
}

export class HardEligibilityEngine {
  /**
   * Deterministically evaluates if a business meets the hard criteria of a opportunity.
   * Semantic search discovers relevance; this engine verifies facts.
   */
  static evaluate(opportunity: ScoredOpportunity, intent: EntrepreneurIntent, business: Business): EligibilityResult {
    const reasons: string[] = [];
    const missingInfo: string[] = [];
    let isEligible = true;
    let isPotentiallyEligible = false;

    // 1. Sector Check
    if (opportunity.sector) {
      if (intent.sector && opportunity.sector !== intent.sector) {
        reasons.push(`Opportunity targets ${opportunity.sector}, but you selected ${intent.sector}.`);
        isEligible = false;
      } else if (!intent.sector) {
        missingInfo.push('Business Sector');
      } else {
        reasons.push(`Sector matches: ${opportunity.sector}`);
      }
    }

    // 2. Business Stage Check
    if (opportunity.businessStage) {
      if (intent.businessStage && opportunity.businessStage !== intent.businessStage) {
        reasons.push(`Opportunity targets ${opportunity.businessStage} stage, but you are ${intent.businessStage}.`);
        isEligible = false;
      } else if (!intent.businessStage) {
        missingInfo.push('Business Stage');
      } else {
        reasons.push(`Stage matches: ${opportunity.businessStage}`);
      }
    }

    // 3. Marginalized Category / Target Beneficiaries Check
    // E.g., Stand-Up India requires SC/ST or Woman
    const rulesLower = (opportunity.eligibilityRules || '').toLowerCase();
    
    if (rulesLower.includes('sc/st') || rulesLower.includes('woman') || rulesLower.includes('women')) {
      if (intent.entrepreneurCategory === 'WOMAN' || intent.entrepreneurCategory === 'SC_ST') {
        reasons.push('Meets target demographic requirements (Woman / SC/ST).');
      } else if (intent.entrepreneurCategory) {
        reasons.push('This opportunity is specifically for SC/ST or Women entrepreneurs.');
        isEligible = false;
      } else {
        missingInfo.push('Entrepreneur Category (e.g., General, Woman, SC/ST)');
        isPotentiallyEligible = true;
      }
    }

    // 4. Determine final status
    let status: EligibilityResult['status'] = 'ELIGIBLE';
    
    if (!isEligible) {
      status = 'NOT_ELIGIBLE';
    } else if (missingInfo.length > 0) {
      // If we are missing info that MIGHT disqualify them, they are potentially eligible
      status = 'POTENTIALLY_ELIGIBLE';
      reasons.push(`Missing ${missingInfo.length} pieces of information to confirm full eligibility.`);
    }

    // If everything passed and no missing info, it remains ELIGIBLE
    return { status, reasons, missingInfo };
  }
}
