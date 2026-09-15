export interface EmbeddingProvider {
  /**
   * Returns a vector representing the text.
   */
  embed(text: string): Promise<number[]>;

  /**
   * Returns a batch of vectors for multiple texts.
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Identifies the specific model being used (e.g. text-embedding-004)
   */
  getModelName(): string;
  
  /**
   * Dimension size returned by this provider
   */
  getDimensions(): number;
}
