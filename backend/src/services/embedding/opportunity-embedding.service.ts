import { prisma } from '../../db.js';
import { getEmbeddingProvider } from './index.js';
import { Opportunity } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '../../utils/logger.js';

export class OpportunityEmbeddingService {
  /**
   * Generates a canonical, semantically rich document representing the opportunity.
   * This is what gets embedded. It avoids raw JSON noise and prioritizes 
   * the true meaning of the opportunity.
   */
  static generateCanonicalDocument(opportunity: Opportunity): string {
    return [
      `Opportunity Name: ${opportunity.title}`,
      `Department: ${opportunity.department}`,
      `Sector: ${opportunity.sector || 'Agnostic'}`,
      `Target Beneficiaries: ${opportunity.targetBeneficiaries || 'General'}`,
      `Support Type: ${opportunity.supportType || 'Financial'}`,
      `Business Stage: ${opportunity.businessStage || 'Any'}`,
      `Description: ${opportunity.description}`,
      `Benefits: ${opportunity.benefits}`,
      `Eligibility Rules: ${opportunity.eligibilityRules}`,
      `Keywords: ${opportunity.keywords || ''}`
    ].filter(Boolean).join('\n\n');
  }

  static computeContentHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Embeds a single opportunity if its content has changed or it doesn't have an embedding.
   */
  static async embedOpportunity(opportunityId: string): Promise<boolean> {
    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) throw new Error(`Opportunity ${opportunityId} not found`);

    if (opportunity.status === 'INACTIVE' || opportunity.status === 'EXPIRED') {
      // Don't embed inactive opportunitys
      return false;
    }

    const provider = getEmbeddingProvider();
    const modelName = provider.getModelName();
    const canonicalText = this.generateCanonicalDocument(opportunity);
    const contentHash = this.computeContentHash(canonicalText);

    // Check if current embedding is already up to date
    const existing = await prisma.opportunityEmbedding.findUnique({
      where: { opportunityId_embeddingModel: { opportunityId, embeddingModel: modelName } }
    });

    if (existing && existing.contentHash === contentHash && existing.status === 'CURRENT') {
      logger.debug(`Opportunity ${opportunity.title} embedding is up to date.`);
      return false; // No update needed
    }

    try {
      logger.info(`Generating embedding for opportunity: ${opportunity.title} using ${modelName}`);
      const vector = await provider.embed(canonicalText);

      await prisma.opportunityEmbedding.upsert({
        where: { opportunityId_embeddingModel: { opportunityId, embeddingModel: modelName } },
        update: {
          contentHash,
          embeddingVector: JSON.stringify(vector),
          dimensions: provider.getDimensions(),
          status: 'CURRENT',
          sourceDocument: canonicalText,
        },
        create: {
          opportunityId,
          embeddingModel: modelName,
          embeddingVersion: '1.0',
          contentHash,
          embeddingVector: JSON.stringify(vector),
          dimensions: provider.getDimensions(),
          status: 'CURRENT',
          sourceDocument: canonicalText,
        }
      });

      return true;
    } catch (error: any) {
      logger.error(`Failed to embed opportunity ${opportunityId}:`, error);
      
      // Mark as failed if we have a record
      if (existing) {
        await prisma.opportunityEmbedding.update({
          where: { id: existing.id },
          data: { status: 'FAILED' }
        });
      }
      throw error;
    }
  }

  /**
   * Batch embeds all active opportunitys that need it. Safe to run repeatedly.
   */
  static async embedAllOpportunitys(): Promise<{ processed: number, updated: number, failed: number }> {
    const activeOpportunitys = await prisma.opportunity.findMany({
      where: { status: 'ACTIVE' }
    });

    let updated = 0;
    let failed = 0;

    for (const opportunity of activeOpportunitys) {
      try {
        const didUpdate = await this.embedOpportunity(opportunity.id);
        if (didUpdate) updated++;
      } catch (e) {
        failed++;
      }
    }

    return { processed: activeOpportunitys.length, updated, failed };
  }
}

