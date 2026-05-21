import { createPinia } from 'pinia'

export const piniaStore = createPinia()

export function setupStore(app) {
  app.use(piniaStore)
}

export { useUserStore } from './modules/user'
