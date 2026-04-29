import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/build/' : '/',
  plugins: [react({}), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../public/build',
    emptyOutDir: true,
    manifest: true, // Tạo manifest.json như Laravel
    rollupOptions: {
      input: {
        cms: resolve(__dirname, 'src/app.tsx'),
        // Thêm entry khác nếu cần
        // admin: resolve(__dirname, 'src/resources/js/admin/app.tsx'),
      },
      output: {
        manualChunks(id) {
          if (/\/react(?:-dom)?/.test(id)) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:5173',
  },
}))
