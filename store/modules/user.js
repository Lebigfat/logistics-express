import { defineStore } from 'pinia'

const LEGACY_TOKEN_KEY = 'xjy_token'
const LEGACY_USER_KEY = 'xjy_userinfo'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync(LEGACY_TOKEN_KEY) || '',
    userInfo: uni.getStorageSync(LEGACY_USER_KEY) || {},
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
    },

    setUserInfo(userInfo = {}) {
      this.userInfo = userInfo
    },

    logout() {
      this.token = ''
      this.userInfo = {}
      uni.removeStorageSync(LEGACY_TOKEN_KEY)
      uni.removeStorageSync(LEGACY_USER_KEY)
    },
  },

  persist: {
    paths: ['token', 'userInfo'],
  },
})
