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
    const eligibility = HardEligibilityEngine.evaluate(opportunity, intent, business);
    
    // Calculate Relevance Level (Semantic)
    let relevanceLevel = 'LOW';
    if (opportunity.semanticScore > 0.8) relevanceLevel = 'HIGH';
    else if (opportunity.semanticScore > 0.5) relevanceLevel = 'MODERATE';

    // Override relevance if hard eligibility fails completely
    if (eligibility.status === 'NOT_ELIGIBLE') {
      relevanceLevel = 'LOW';
    }

    // Confidence Level (Data Completeness)
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
      source: opportunity.sourceOrganization || 'Government Portal',
      url: opportunity.officialUrl,
      tier: opportunity.sourceTier || 'UNKNOWN',
      version: opportunity.sourceVersion || '1.0',
      dataStatus: opportunity.dataStatus,
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
        eligibilityStatus: eligibility.status,
        confidenceLevel,
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
        relevanceLevel,
        eligibilityStatus: eligibility.status,
        confidenceLevel,
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
