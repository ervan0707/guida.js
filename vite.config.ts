import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
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
        globals: {}
      }
    },
    sourcemap: true,
    minify: false, // Disable minification in watch mode for faster builds
    watch: {
      // Watch for changes in src directory
      include: 'src/**'
    }
  },
  server: {
    open: '/example'
  }
})
