import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/wordle': {
        target: 'https://www.nytimes.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wordle/, '/svc/wordle/v2'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html',
        },
        secure: true,
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
