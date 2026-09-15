import { EntrepreneurIntent, Business } from '@prisma/client';
import { ScoredOpportunity } from '../search/hybrid-search.service.js';

export interface EligibilityResult {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INSUFFICIENT_INFORMATION';
  reasons: string[];
  missingInfo: string[];
}

export class HardEligibilityEngine {
  /**
   * Deterministically evaluates if a business meets the hard criteria of an opportunity.
   * Phase 11: Hard Constraints must be evaluated strictly before soft relevance.
   */
  static evaluate(opportunity: ScoredOpportunity, intent: EntrepreneurIntent, business: Business): EligibilityResult {
    const reasons: string[] = [];
    const missingInfo: string[] = [];
    let isEligible = true;
    let isPotentiallyEligible = false;

    // Phase 11: Hard Constraint 1 - Country Restrictions
    if (opportunity.country && opportunity.country !== 'GLOBAL') {
      const bizCountry = business.countryCode || intent.country;
      if (bizCountry && opportunity.country !== bizCountry) {
        reasons.push(`Opportunity requires operation in ${opportunity.country}, but you operate in ${bizCountry}.`);
        isEligible = false;
      } else if (!bizCountry) {
        missingInfo.push('Country of Operation');
      } else {
        reasons.push(`Country match verified (${opportunity.country}).`);
      }
    }

    // Phase 11: Hard Constraint 2 - Age Requirements
    if (opportunity.minAge || opportunity.maxAge) {
      if (intent.founderAge) {
        if (opportunity.minAge && intent.founderAge < opportunity.minAge) {
          reasons.push(`Founder must be at least ${opportunity.minAge} years old (you are ${intent.founderAge}).`);
          isEligible = false;
        } else if (opportunity.maxAge && intent.founderAge > opportunity.maxAge) {
          reasons.push(`Founder must be at most ${opportunity.maxAge} years old (you are ${intent.founderAge}).`);
          isEligible = false;
        } else {
          reasons.push(`Age requirements verified.`);
        }
      } else {
        missingInfo.push('Founder Age');
      }
    }

    // Phase 11: Hard Constraint 3 - Organization Type
    if (opportunity.allowedOrgTypes) {
      const allowed = opportunity.allowedOrgTypes.toLowerCase();
      const orgType = (business.organizationType || intent.organizationType || '').toLowerCase();
      if (orgType) {
        if (!allowed.includes(orgType) && !allowed.includes('any')) {
          reasons.push(`Opportunity restricts organization type. Required: ${opportunity.allowedOrgTypes}. Your type: ${orgType}.`);
          isEligible = false;
        } else {
          reasons.push(`Organization type verified.`);
        }
      } else {
        missingInfo.push('Organization Type / Business Registration Type');
      }
    }

    // Phase 11: Hard Constraint 4 - Sector Check
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

    // Phase 11: Hard Constraint 5 - Business Stage Check
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

    // Phase 11: Marginalized Category Check (Legacy SIH heuristic)
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

    // Determine final status based on Phase 11 Rules
    let status: EligibilityResult['status'] = 'ELIGIBLE';
    
    if (!isEligible) {
      status = 'NOT_ELIGIBLE';
    } else if (missingInfo.length > 0) {
      status = 'POTENTIALLY_ELIGIBLE';
      reasons.push(`Missing ${missingInfo.length} pieces of information to confirm full eligibility.`);
    }

    return { status, reasons, missingInfo };
  }
}
