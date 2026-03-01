import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8008,
  },
  build: {
    // Suppress chunk size warning — single-file OS architecture is intentional.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['jspdf'],
        },
      },
    },
    // Minification
    minify: 'esbuild',
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
  },
})
