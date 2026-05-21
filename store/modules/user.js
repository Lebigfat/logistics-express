import { defineStore } from 'pinia'
import storage from '@/utils/storage'

const TOKEN_KEY = 'token'
const USER_KEY = 'userinfo'
const LEGACY_TOKEN_KEY = 'xjy_token'
const LEGACY_USER_KEY = 'xjy_userinfo'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: storage.get(TOKEN_KEY, '') || uni.getStorageSync(LEGACY_TOKEN_KEY) || '',
    userInfo: storage.get(USER_KEY, {}) || uni.getStorageSync(LEGACY_USER_KEY) || {},
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },

  actions: {
    setLoginInfo(data = {}) {
      const userInfo = data.userinfo || data.userInfo || data.user || data
      const token = data.token || data.accessToken || userInfo?.token || ''

      this.token = token
      this.userInfo = userInfo || {}

      storage.set(TOKEN_KEY, this.token)
      storage.set(USER_KEY, this.userInfo)
    },

    setUserInfo(userInfo = {}) {
      this.userInfo = userInfo
      storage.set(USER_KEY, userInfo)
    },

    logout() {
      this.token = ''
      this.userInfo = {}
      storage.remove(TOKEN_KEY)
      storage.remove(USER_KEY)
      uni.removeStorageSync(LEGACY_TOKEN_KEY)
      uni.removeStorageSync(LEGACY_USER_KEY)
    },
  },
})
