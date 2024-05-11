import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 全部配置项可以在这个地址查看：https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8081,
    strictPort: true,
    proxy: {
      '/bg-admin': {
        target: 'http://127.0.0.1:14040',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/bg-/, '/')
      },
      '/bg-admin/terminal/ws': {
        target: 'http://127.0.0.1:14040',
        ws: true,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/bg-/, '/')
      }
    }
  },
  plugins: [
    vue(),
  ],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
