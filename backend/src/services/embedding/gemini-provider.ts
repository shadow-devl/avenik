import { EmbeddingProvider } from './embedding-provider.js';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../../utils/logger.js';

export class GeminiProvider implements EmbeddingProvider {
  private ai: GoogleGenAI;
  private readonly modelName = 'text-embedding-004';
  private readonly dimensions = 768; // Gemini text-embedding-004 standard output

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    // Initialize the official Google Gen AI SDK
    this.ai = new GoogleGenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: this.modelName,
        contents: text,
      });
      
      const vector = response.embeddings?.[0]?.values;
      if (!vector || vector.length === 0) {
        throw new Error('Gemini API returned an empty embedding vector.');
      }
      return vector;
    } catch (error: any) {
      logger.error('Failed to embed text using Gemini API:', error);
      throw error;
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      // In a real high-throughput scenario, we would batch these efficiently
      // with Promise.all and rate limiting. For now, Promise.all handles it.
      const vectors = await Promise.all(texts.map(t => this.embed(t)));
      return vectors;
    } catch (error: any) {
      logger.error('Failed to batch embed texts using Gemini API:', error);
      throw error;
    }
  }

  getModelName(): string {
    return this.modelName;
  }

  getDimensions(): number {
    return this.dimensions;
  }
}
