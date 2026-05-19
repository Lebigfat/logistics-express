const DEFAULT_BASE_URL = 'http://prod-cn.your-api-server.com'
const TOKEN_KEY = 'xjy_token'
const USER_KEY = 'xjy_userinfo'

const getEnvBaseUrl = () => {
  // #ifdef H5
  return import.meta.env?.VITE_API_BASE_URL
  // #endif
}

export const API_BASE_URL = getEnvBaseUrl() || DEFAULT_BASE_URL

export const getToken = () => uni.getStorageSync(TOKEN_KEY) || ''

export const setToken = (token) => {
  if (token) uni.setStorageSync(TOKEN_KEY, token)
}

export const getStoredUser = () => uni.getStorageSync(USER_KEY) || null

export const setStoredUser = (user) => {
  if (user) uni.setStorageSync(USER_KEY, user)
  if (user?.token) setToken(user.token)
}

const buildUrl = (url) => (/^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`)

export const request = ({ url, method = 'GET', data = {}, header = {}, needToken = true }) =>
  new Promise((resolve, reject) => {
    const token = getToken()
    uni.request({
      url: buildUrl(url),
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...(needToken && token ? { token } : {}),
        ...header,
      },
      success: (res) => {
        const body = res.data
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        if (body && typeof body === 'object' && 'code' in body && body.code !== 1) {
          reject(new Error(body.msg || '接口请求失败'))
          return
        }
        resolve(body?.data ?? body)
      },
      fail: reject,
    })
  })

export const uploadFile = ({ url, filePath, name = 'file', formData = {} }) =>
  new Promise((resolve, reject) => {
    const token = getToken()
    uni.uploadFile({
      url: buildUrl(url),
      filePath,
      name,
      formData,
      header: token ? { token } : {},
      success: (res) => {
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (body?.code !== 1) {
            reject(new Error(body?.msg || '上传失败'))
            return
          }
          resolve(body.data)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject,
    })
  })
