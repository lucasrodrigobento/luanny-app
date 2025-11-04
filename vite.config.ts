import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Rule for the real SEFAZ API backend
      '/sefaz': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})