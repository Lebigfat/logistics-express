import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "uview-plus/theme.scss";`
      }
    }
  },

  optimizeDeps: {
    include: [
      'uview-plus'
    ]
  },

  build: {
    // 避免 uv-ui 被 tree-shaking 掉样式
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },

  server: {
    port: 5173,
    host: true
  }
})
