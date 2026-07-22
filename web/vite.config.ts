import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 문서 05 §2-1 / 04 §0: 개발은 프론트가 /api 를 백엔드(localhost:8000)로 프록시.
// 빌드된 SPA 는 동일 오리진 서빙이므로 상대경로 /api 를 그대로 사용한다.
// VITE_API_BASE_URL 로 다른 오리진(스테이징 등) 지정 가능(shared/api/client 참조).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/images': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
