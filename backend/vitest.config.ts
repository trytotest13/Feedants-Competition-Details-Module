import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 120000,
    fileParallelism: false, // one shared in-memory MongoDB per run
  },
});
