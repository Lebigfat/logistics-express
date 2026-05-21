import storage from '@/utils/storage'
import { $toast } from '@/utils/toast'

const DEFAULT_BASE_URL = 'http://prod-cn.your-api-server.com'
const TOKEN_KEY = 'token'
const USER_KEY = 'userinfo'
const LEGACY_TOKEN_KEY = 'xjy_token'
const LEGACY_USER_KEY = 'xjy_userinfo'

let loadingCount = 0

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL

export const getToken = () => storage.get(TOKEN_KEY, '') || uni.getStorageSync(LEGACY_TOKEN_KEY) || ''

export const setToken = (token) => {
  if (token) storage.set(TOKEN_KEY, token)
}

export const getStoredUser = () => storage.get(USER_KEY, null) || uni.getStorageSync(LEGACY_USER_KEY) || null

export const setStoredUser = (user) => {
  if (user) storage.set(USER_KEY, user)
  if (user?.token) setToken(user.token)
}

export const clearAuth = () => {
  storage.remove(TOKEN_KEY)
  storage.remove(USER_KEY)
  uni.removeStorageSync(LEGACY_TOKEN_KEY)
  uni.removeStorageSync(LEGACY_USER_KEY)
}

const buildUrl = (url) => (/^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`)
const resolveMessage = (body, fallback) => body?.msg || body?.message || fallback

const showLoading = (title = 'Loading...') => {
  loadingCount += 1
  if (loadingCount === 1) {
    uni.showLoading({ title, mask: true })
  }
}

const hideLoading = () => {
  loadingCount = Math.max(loadingCount - 1, 0)
  if (loadingCount === 0) {
    uni.hideLoading()
  }
}

export const request = ({ url, method = 'GET', data = {}, header = {}, needToken = true, custom = {} }) =>
  new Promise((resolve, reject) => {
    const token = getToken()

    if (custom.loading) {
      showLoading(custom.loadingText)
    }

    uni.request({
      url: buildUrl(url),
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...(needToken && token ? { token, Authorization: `Bearer ${token}` } : {}),
        ...header,
      },
      success: (res) => {
        const body = res.data

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const error = new Error(resolveMessage(body, `HTTP ${res.statusCode}`))
          if (custom.toast !== false) $toast.show(error.message)
          reject(error)
          return
        }

        if (body && typeof body === 'object' && 'code' in body && body.code !== 1) {
          const error = new Error(resolveMessage(body, 'Request failed'))
          if (custom.toast !== false) $toast.show(error.message)
          reject(error)
          return
        }

        resolve(body?.data ?? body)
      },
      fail: (error) => {
        const message = error?.errMsg || 'Network request failed'
        if (custom.toast !== false) $toast.show(message)
        reject(new Error(message))
      },
      complete: () => {
        if (custom.loading) hideLoading()
      },
    })
  })

export const uploadFile = ({ url, filePath, name = 'file', formData = {}, custom = {} }) =>
  new Promise((resolve, reject) => {
    const token = getToken()

    if (custom.loading) {
      showLoading(custom.loadingText || 'Uploading...')
    }

    uni.uploadFile({
      url: buildUrl(url),
      filePath,
      name,
      formData,
      header: token ? { token, Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (body?.code !== 1) {
            const error = new Error(resolveMessage(body, 'Upload failed'))
            if (custom.toast !== false) $toast.show(error.message)
            reject(error)
            return
          }
          resolve(body.data)
        } catch (error) {
          if (custom.toast !== false) $toast.show(error.message || 'Upload failed')
          reject(error)
        }
      },
      fail: (error) => {
        const message = error?.errMsg || 'Upload failed'
        if (custom.toast !== false) $toast.show(message)
        reject(new Error(message))
      },
      complete: () => {
        if (custom.loading) hideLoading()
      },
    })
  })
