import { prisma } from '../../db.js';
import { getEmbeddingProvider } from './index.js';
import { GovernmentScheme } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '../../utils/logger.js';

export class SchemeEmbeddingService {
  /**
   * Generates a canonical, semantically rich document representing the scheme.
   * This is what gets embedded. It avoids raw JSON noise and prioritizes 
   * the true meaning of the scheme.
   */
  static generateCanonicalDocument(scheme: GovernmentScheme): string {
    return [
      `Scheme Name: ${scheme.title}`,
      `Department: ${scheme.department}`,
      `Sector: ${scheme.sector || 'Agnostic'}`,
      `Target Beneficiaries: ${scheme.targetBeneficiaries || 'General'}`,
      `Support Type: ${scheme.supportType || 'Financial'}`,
      `Business Stage: ${scheme.businessStage || 'Any'}`,
      `Description: ${scheme.description}`,
      `Benefits: ${scheme.benefits}`,
      `Eligibility Rules: ${scheme.eligibilityRules}`,
      `Keywords: ${scheme.keywords || ''}`
    ].filter(Boolean).join('\n\n');
  }

  static computeContentHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Embeds a single scheme if its content has changed or it doesn't have an embedding.
   */
  static async embedScheme(schemeId: string): Promise<boolean> {
    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });
    if (!scheme) throw new Error(`Scheme ${schemeId} not found`);

    if (scheme.status === 'INACTIVE' || scheme.status === 'EXPIRED') {
      // Don't embed inactive schemes
      return false;
    }

    const provider = getEmbeddingProvider();
    const modelName = provider.getModelName();
    const canonicalText = this.generateCanonicalDocument(scheme);
    const contentHash = this.computeContentHash(canonicalText);

    // Check if current embedding is already up to date
    const existing = await prisma.schemeEmbedding.findUnique({
      where: { schemeId_embeddingModel: { schemeId, embeddingModel: modelName } }
    });

    if (existing && existing.contentHash === contentHash && existing.status === 'CURRENT') {
      logger.debug(`Scheme ${scheme.title} embedding is up to date.`);
      return false; // No update needed
    }

    try {
      logger.info(`Generating embedding for scheme: ${scheme.title} using ${modelName}`);
      const vector = await provider.embed(canonicalText);

      await prisma.schemeEmbedding.upsert({
        where: { schemeId_embeddingModel: { schemeId, embeddingModel: modelName } },
        update: {
          contentHash,
          embeddingVector: JSON.stringify(vector),
          dimensions: provider.getDimensions(),
          status: 'CURRENT',
          sourceDocument: canonicalText,
        },
        create: {
          schemeId,
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
    } catch (error) {
      logger.error(`Failed to embed scheme ${schemeId}:`, error);
      
      // Mark as failed if we have a record
      if (existing) {
        await prisma.schemeEmbedding.update({
          where: { id: existing.id },
          data: { status: 'FAILED' }
        });
      }
      throw error;
    }
  }

  /**
   * Batch embeds all active schemes that need it. Safe to run repeatedly.
   */
  static async embedAllSchemes(): Promise<{ processed: number, updated: number, failed: number }> {
    const activeSchemes = await prisma.governmentScheme.findMany({
      where: { status: 'ACTIVE' }
    });

    let updated = 0;
    let failed = 0;

    for (const scheme of activeSchemes) {
      try {
        const didUpdate = await this.embedScheme(scheme.id);
        if (didUpdate) updated++;
      } catch (e) {
        failed++;
      }
    }

    return { processed: activeSchemes.length, updated, failed };
  }
}
