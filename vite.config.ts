import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: false,
  },
  server: {
    proxy: {
      // Proxy wordle requests to the Express server, which owns the
      // NYT fetch, persistent cache, and no-store headers. We used to
      // proxy directly to nytimes.com here, which caused 304 Not Modified
      // responses to reach the client and be treated as fetch failures.
      '/api/wordle': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/games': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/results': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
