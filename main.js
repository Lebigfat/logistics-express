import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './store'
import { debugLog } from './services/request'

export function createApp() {
  debugLog('info', 'app:createApp', {
    time: new Date().toISOString(),
  })
  const app = createSSRApp(App)
  setupStore(app)
  return { app }
}
