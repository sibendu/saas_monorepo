import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ["src/**/*.test.ts", "src/**/*.unit.test.ts", "src/**/*.integration.test.ts"],
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
})
