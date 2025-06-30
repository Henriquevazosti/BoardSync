/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Otimizações de performance
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks
          vendor: ['react', 'react-dom'],
          // Componentes lazy
          modals: [
            './src/components/NewCardModal/NewCardModal.jsx',
            './src/components/CommentsModal/CommentsModal.jsx',
            './src/components/CardDetailView/CardDetailView.jsx'
          ],
          filters: [
            './src/components/CategoryFilter/CategoryFilter.jsx',
            './src/components/DueDateFilter/DueDateFilter.jsx'
          ],
          managers: [
            './src/components/LabelManager/LabelManager.jsx',
            './src/components/UserManager/UserManager.jsx',
            './src/components/DataManager/DataManager.jsx'
          ]
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vitejs/plugin-react']
  },
  // Aliases para imports mais limpos
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
      '@contexts': '/src/contexts'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: true,
  }
})
