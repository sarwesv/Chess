import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Chess/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['stockfish'],
  },
  worker: {
    format: 'es',
  },
})
