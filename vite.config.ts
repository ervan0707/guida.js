import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode, command }) => ({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SpotlightOnboarding',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm.' : ''}js`
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        exports: 'named' // Use named exports only
      }
    },
    sourcemap: mode === 'development', // Only generate source maps in development
    minify: mode === 'production' ? 'terser' : false,
    target: 'es2018'
  },
  server: {
    open: '/example'
  }
}))
