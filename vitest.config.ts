import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, //30s
    hookTimeout: 30000, //30s
    fileParallelism: false,
    maxConcurrency: 1
  },
});