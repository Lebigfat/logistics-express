import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './store'

export function createApp() {
  console.info('[app:createApp]', {
    time: new Date().toISOString(),
  })
  const app = createSSRApp(App)
  setupStore(app)
  return { app }
}
