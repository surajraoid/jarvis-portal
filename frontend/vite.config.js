import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* and /ws/* calls to the FastAPI backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    // Code-split vendor libraries for faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'charts':        ['recharts'],
          'motion':        ['framer-motion'],
          'icons':         ['react-icons'],
          'http':          ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
