import { prisma } from '../../db.js';
import { EntrepreneurIntent, Business } from '@prisma/client';
import { ScoredOpportunity } from '../search/hybrid-search.service.js';
import { HardEligibilityEngine } from '../eligibility/hard-eligibility.service.js';

export class ExplanationService {
  /**
   * Orchestrates semantic score and hard eligibility into a final explained result.
   */
  static async generateMatchResult(
    intent: EntrepreneurIntent,
    business: Business,
    opportunity: ScoredOpportunity
  ) {
    // HARD CONSTRAINTS
    const eligibility = HardEligibilityEngine.evaluate(opportunity, intent, business);
    
    // RELEVANCE
    // Relevance is kept strictly separate from Eligibility and Confidence
    // It reflects only "How well does this opportunity fit the stated objective?"
    let relevanceLevel = 'LOW';
    if (opportunity.semanticScore > 0.8) relevanceLevel = 'HIGH';
    else if (opportunity.semanticScore > 0.5) relevanceLevel = 'MODERATE';

    // CONFIDENCE
    // Confidence represents the quality of the matching evidence (data completeness, etc.)
    let confidenceLevel = 'HIGH';
    if (eligibility.missingInfo.length > 2) confidenceLevel = 'LOW';
    else if (eligibility.missingInfo.length > 0) confidenceLevel = 'MODERATE';

    // Evidence Readiness Mapping
    const evidenceReadiness = {
      required: ['Business Registration Certificate', 'Aadhaar Card', 'PAN Card'],
      provided: [],
      missing: ['Business Registration Certificate', 'Aadhaar Card', 'PAN Card']
    };

    // Provenance formatting
    const provenance = {
      source: 'Avenik Global Fabric',
      url: opportunity.officialUrl,
      tier: 'VERIFIED',
      version: '1.1',
      dataStatus: 'ACTIVE',
      lastChecked: opportunity.lastVerifiedAt
    };

    return await prisma.opportunityMatchResult.upsert({
      where: {
        intentId_opportunityId: {
          intentId: intent.id,
          opportunityId: opportunity.id
        }
      },
      update: {
        semanticScore: opportunity.semanticScore,
        relevanceLevel,
        eligibilityStatus: eligibility.status, // Phase 11
        confidenceLevel, // Phase 13
        reasons: JSON.stringify(eligibility.reasons),
        missingInfo: JSON.stringify(eligibility.missingInfo),
        evidenceReadiness: JSON.stringify(evidenceReadiness),
        provenance: JSON.stringify(provenance),
        applicationRoute: opportunity.officialUrl,
        discoveryMethod: opportunity.semanticScore > 0 ? 'HYBRID' : 'KEYWORD'
      },
      create: {
        intentId: intent.id,
        opportunityId: opportunity.id,
        businessId: business.id,
        semanticScore: opportunity.semanticScore,
        relevanceLevel, // Phase 12
        eligibilityStatus: eligibility.status, // Phase 11
        confidenceLevel, // Phase 13
        reasons: JSON.stringify(eligibility.reasons),
        missingInfo: JSON.stringify(eligibility.missingInfo),
        evidenceReadiness: JSON.stringify(evidenceReadiness),
        provenance: JSON.stringify(provenance),
        applicationRoute: opportunity.officialUrl,
        discoveryMethod: opportunity.semanticScore > 0 ? 'HYBRID' : 'KEYWORD'
      }
    });
  }
}
