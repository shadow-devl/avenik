import { EmbeddingProvider } from './embedding-provider.js';
import { FallbackProvider } from './fallback-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { logger } from '../../utils/logger.js';

let instance: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (instance) return instance;

  // Track 1: Prioritize Gemini if the API key is present.
  if (process.env.GEMINI_API_KEY) {
    try {
      instance = new GeminiProvider();
      logger.info(`🤖 Initialized Gemini Embedding Provider (${instance.getModelName()})`);
      return instance;
    } catch (error: any) {
      logger.warn(`Failed to initialize GeminiProvider, falling back to dummy provider: ${error.message}`);
    }
  }

  // Fallback for development without API keys
  instance = new FallbackProvider();
  logger.info(`⚠️ Initialized Fallback (Pseudo) Embedding Provider (${instance.getModelName()}). Provide GEMINI_API_KEY for real AI matching.`);
  return instance;
}
