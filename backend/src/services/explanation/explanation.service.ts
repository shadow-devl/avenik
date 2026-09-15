import { prisma } from '../../db.js';
import { EntrepreneurIntent, Business } from '@prisma/client';
import { ScoredScheme } from '../search/hybrid-search.service.js';
import { HardEligibilityEngine } from '../eligibility/hard-eligibility.service.js';

export class ExplanationService {
  /**
   * Orchestrates semantic score and hard eligibility into a final explained result.
   */
  static async generateMatchResult(
    intent: EntrepreneurIntent,
    business: Business,
    scheme: ScoredScheme
  ) {
    const eligibility = HardEligibilityEngine.evaluate(scheme, intent, business);
    
    // Calculate Relevance Level (Semantic)
    let relevanceLevel = 'LOW';
    if (scheme.semanticScore > 0.8) relevanceLevel = 'HIGH';
    else if (scheme.semanticScore > 0.5) relevanceLevel = 'MODERATE';

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
      source: scheme.sourceOrganization || 'Government Portal',
      url: scheme.officialUrl,
      tier: scheme.sourceTier || 'UNKNOWN',
      version: scheme.sourceVersion || '1.0',
      dataStatus: scheme.dataStatus,
      lastChecked: scheme.lastVerifiedAt
    };

    return await prisma.schemeMatchResult.upsert({
      where: {
        intentId_schemeId: {
          intentId: intent.id,
          schemeId: scheme.id
        }
      },
      update: {
        semanticScore: scheme.semanticScore,
        relevanceLevel,
        eligibilityStatus: eligibility.status,
        confidenceLevel,
        reasons: JSON.stringify(eligibility.reasons),
        missingInfo: JSON.stringify(eligibility.missingInfo),
        evidenceReadiness: JSON.stringify(evidenceReadiness),
        provenance: JSON.stringify(provenance),
        applicationRoute: scheme.officialUrl,
        discoveryMethod: scheme.semanticScore > 0 ? 'HYBRID' : 'KEYWORD'
      },
      create: {
        intentId: intent.id,
        schemeId: scheme.id,
        businessId: business.id,
        semanticScore: scheme.semanticScore,
        relevanceLevel,
        eligibilityStatus: eligibility.status,
        confidenceLevel,
        reasons: JSON.stringify(eligibility.reasons),
        missingInfo: JSON.stringify(eligibility.missingInfo),
        evidenceReadiness: JSON.stringify(evidenceReadiness),
        provenance: JSON.stringify(provenance),
        applicationRoute: scheme.officialUrl,
        discoveryMethod: scheme.semanticScore > 0 ? 'HYBRID' : 'KEYWORD'
      }
    });
  }
}
