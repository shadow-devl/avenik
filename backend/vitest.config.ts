import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { 
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    environment: 'node',
    fileParallelism: false,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
