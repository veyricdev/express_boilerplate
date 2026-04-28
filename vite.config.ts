import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react({})],
  build: {
    outDir: 'public/build',
    manifest: true, // Tạo manifest.json như Laravel
    rollupOptions: {
      input: {
        cms: resolve(__dirname, 'src/resources/js/cms/app.tsx'),
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
  },
})
