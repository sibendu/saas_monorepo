import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.unit.test.{ts,tsx}",
      "src/**/*.integration.test.{ts,tsx}",
    ],
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './reports/junit.xml',
      json: './reports/results.json',
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './reports/coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
