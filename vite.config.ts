import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // import '@/xxx' を src 配下に解決
    },
  },
  server: {
    host: true,          // LAN公開も可
    port: 5173,
    open: false,         // 起動時に自動でブラウザは開かない（好みで true にしてOK）
    // HMR オーバーレイはデフォルトで有効（= エラーがブラウザに表示）
    // もし意図せず無効化していたら、下のコメントを外さないように！
    // hmr: { overlay: true },
  },
  // 必要ならパフォーマンス調整（任意）
  // esbuild: { jsxDev: true },
})
