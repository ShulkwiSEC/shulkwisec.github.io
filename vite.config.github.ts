import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub Pages deployment configuration
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group core framework together for stability
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('wouter') ||
              id.includes('scheduler')
            ) {
              return 'vendor-core';
            }
            if (id.includes('framer-motion')) return 'vendor-animation';
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('highlight.js')) return 'vendor-highlight';
            if (
              id.includes('marked') ||
              id.includes('dompurify') ||
              id.includes('recharts')
            ) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
});
