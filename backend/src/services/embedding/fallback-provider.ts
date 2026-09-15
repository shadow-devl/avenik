import { EmbeddingProvider } from './embedding-provider.js';
import crypto from 'crypto';

/**
 * A fallback embedding provider that generates deterministic pseudo-random 
 * float arrays based on SHA-256 hashes of the input text. 
 * 
 * Used for development/demo when a real AI provider API key is not configured,
 * ensuring the semantic pipeline can be executed end-to-end.
 */
export class FallbackProvider implements EmbeddingProvider {
  private readonly dimensions = 768;

  async embed(text: string): Promise<number[]> {
    return this.generateDeterministicVector(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(t => this.generateDeterministicVector(t));
  }

  getModelName(): string {
    return 'fallback-pseudo-vector-v1';
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private generateDeterministicVector(text: string): number[] {
    const hash = crypto.createHash('sha256').update(text).digest();
    const vector: number[] = [];
    
    // Create a 768-dimensional float array deterministically based on the hash
    for (let i = 0; i < this.dimensions; i++) {
      const byteValue = hash[i % hash.length];
      // Normalize to a float between -1 and 1
      const normalized = (byteValue / 127.5) - 1.0; 
      vector.push(normalized);
    }

    // Normalize to unit length (L2 norm) so cosine similarity works
    let magnitude = 0;
    for (const val of vector) {
      magnitude += val * val;
    }
    magnitude = Math.sqrt(magnitude);

    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / magnitude;
      }
    }

    return vector;
  }
}
