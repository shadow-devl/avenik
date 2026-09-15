import { prisma } from '../../db.js';
import { getEmbeddingProvider } from '../embedding/index.js';
import { EntrepreneurIntent, Opportunity } from '@prisma/client';

export interface ScoredOpportunity extends Opportunity {
  semanticScore: number;
}

export class HybridSearchService {
  /**
   * Calculates the cosine similarity between two vectors.
   */
  static cosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0;
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Performs a semantic search for opportunitys matching the intent's raw query.
   * This is the "discovery" phase before hard eligibility filtering.
   */
  static async discoverCandidates(intent: EntrepreneurIntent, limit: number = 10): Promise<ScoredOpportunity[]> {
    const provider = getEmbeddingProvider();
    const queryVector = await provider.embed(intent.rawQuery);
    const modelName = provider.getModelName();

    // Fetch all CURRENT embeddings for this model
    const embeddings = await prisma.opportunityEmbedding.findMany({
      where: { 
        embeddingModel: modelName,
        status: 'CURRENT'
      },
      include: { opportunity: true }
    });

    // If no embeddings exist, fallback to returning all active opportunitys with score 0
    if (embeddings.length === 0) {
      const allActive = await prisma.opportunity.findMany({ where: { status: 'ACTIVE' }, take: limit });
      return allActive.map(s => ({ ...s, semanticScore: 0 }));
    }

    // Compute similarity in-memory (scales well up to ~10,000 items, perfect for SIH)
    const scoredCandidates = embeddings.map(emb => {
      let opportunityVector: number[];
      try {
        opportunityVector = JSON.parse(emb.embeddingVector);
      } catch (e) {
        opportunityVector = new Array(provider.getDimensions()).fill(0);
      }
      
      const score = this.cosineSimilarity(queryVector, opportunityVector);
      return {
        ...emb.opportunity,
        semanticScore: score
      };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.semanticScore - a.semanticScore);

    // Return top K
    return scoredCandidates.slice(0, limit);
  }
}
