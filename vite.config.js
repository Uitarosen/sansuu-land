import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// タブレット横持ちを第一優先。開発サーバーはLAN公開してiPad実機テストも可能に。
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
