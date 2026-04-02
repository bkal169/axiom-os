import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ include: /\.(jsx?|tsx?)$/ })],
  server: {
    port: 8008,
  },
  build: {
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2020',
    // Inline small assets directly — reduces HTTP round trips
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core + its runtime deps — always cached separately.
          // scheduler is a direct dep of react-dom; react-router is a dep of
          // react-router-dom.  Keeping them together avoids circular imports
          // between vendor-react and vendor-misc that cause white-screen crashes.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          // Recharts split into its own chunk — only loaded when a chart renders
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'vendor-charts';
          }
          // Supabase — only loaded when auth/db is needed
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // PDF — only needed for report export
          if (id.includes('node_modules/jspdf')) {
            return 'vendor-pdf';
          }
          // Anthropic/OpenAI SDKs — only in AI sections
          if (id.includes('node_modules/@anthropic') || id.includes('node_modules/openai')) {
            return 'vendor-ai';
          }
          // All other node_modules get their own named chunk for better caching
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
})
