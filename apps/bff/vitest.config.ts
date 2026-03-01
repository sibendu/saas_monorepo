import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ["src/**/*.test.ts", "src/**/*.unit.test.ts", "src/**/*.integration.test.ts"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
