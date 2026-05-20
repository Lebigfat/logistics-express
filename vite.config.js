const path = require('path')
const uni = require('@dcloudio/vite-plugin-uni')

process.env.UNI_INPUT_DIR = process.env.UNI_INPUT_DIR || __dirname

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
