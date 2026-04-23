// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    historyApiFallback: true, // CRITICAL for React Router
    port: 5173,
    open: true,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },

  // Add this to define environment variables
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify('WE CONNECT EDU'),
    'import.meta.env.VITE_APP_DESCRIPTION': JSON.stringify('Share Knowledge, Earn & Grow'),
    'import.meta.env.VITE_APP_URL': JSON.stringify('https://www.weconnectedu.com.ng'),
  },
})