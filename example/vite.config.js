import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    hmr: true,
  },
  build: {
    outDir: "dist",
  },
  // Enable HMR for parent directory changes
  optimizeDeps: {
    exclude: ["guida-js"],
  },
});
