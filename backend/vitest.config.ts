import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { testTimeout: 30000,
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
