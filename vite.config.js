const path = require('path')
const uni = require('@dcloudio/vite-plugin-uni')

module.exports = {
  plugins: [uni.default ? uni.default() : uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  css: {},
  optimizeDeps: {
    include: ['uview-plus'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    host: true,
  },
}
