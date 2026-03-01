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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
