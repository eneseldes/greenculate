import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/calculate': 'http://localhost:3000',
      '/history': 'http://localhost:3000'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        logger: {
          warn: () => {} // Tüm uyarıları sustur
        }
      }
    }
  }
})
