/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'example/',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts'
      ]
    }
  }
})
