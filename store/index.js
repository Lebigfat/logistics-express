import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export const piniaStore = createPinia()

const piniaStorage = {
  getItem(key) {
    const value = uni.getStorageSync(key)
    return value === '' || value === null || value === undefined ? null : value
  },
  setItem(key, value) {
    uni.setStorageSync(key, value)
  },
}

piniaStore.use(
  createPersistedState({
    storage: piniaStorage,
    key: (storeKey) => `XJY_${storeKey}`,
  }),
)

export function setupStore(app) {
  app.use(piniaStore)
}

export { useUserStore } from './modules/user'
