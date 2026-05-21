import Request from 'luch-request'
import storage from '@/utils/storage'
import { $toast } from '@/utils/toast'

const DEFAULT_BASE_URL = 'https://jdd.cdsljkj.com'
const TOKEN_KEY = 'token'
const USER_KEY = 'userinfo'
const LEGACY_TOKEN_KEY = 'xjy_token'
const LEGACY_USER_KEY = 'xjy_userinfo'

let loadingCount = 0

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL
export const REQUEST_DEBUG_ENABLED = import.meta.env?.VITE_REQUEST_DEBUG !== 'false'

console.info('[api:config]', {
  baseURL: API_BASE_URL,
  timeout: 60000,
  requestDebug: REQUEST_DEBUG_ENABLED,
})

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

const resolveMessage = (body, fallback) => body?.msg || body?.message || body?.errMsg || fallback
const createTraceId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const logRequestDebug = (level, stage, payload) => {
  if (!REQUEST_DEBUG_ENABLED) return
  const logger = console[level] || console.log
  logger(`[request:${stage}]`, payload)
}

const showLoading = (title = '加载中...') => {
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

const parseResponseData = (data) => {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

const normalizeConfig = (options = {}) => ({
  ...options,
  header: {
    'content-type': 'application/json',
    ...(options.header || {}),
  },
  custom: {
    needToken: options.needToken !== false,
    toast: options.custom?.toast,
    loading: options.custom?.loading,
    loadingText: options.custom?.loadingText,
    debug: options.custom?.debug ?? REQUEST_DEBUG_ENABLED,
    ...(options.custom || {}),
  },
})

export const http = new Request({
  baseURL: API_BASE_URL,
  timeout: 60000,
  header: {
    'content-type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  const custom = config.custom || {}

  if (custom.needToken !== false && token) {
    config.header = {
      ...(config.header || {}),
      token,
      Authorization: `Bearer ${token}`,
    }
  }

  if (custom.loading) {
    showLoading(custom.loadingText)
  }

  if (custom.debug) {
    custom.debugTrace = {
      id: createTraceId(),
      startTime: Date.now(),
      method: config.method,
      url: config.url,
      requestUrl: `${config.baseURL || ''}${config.url || ''}`,
    }

    logRequestDebug('info', 'start', {
      id: custom.debugTrace.id,
      method: config.method,
      url: config.url,
      requestUrl: custom.debugTrace.requestUrl,
      needToken: custom.needToken !== false,
      hasToken: Boolean(token),
      dataKeys: config.data && typeof config.data === 'object' ? Object.keys(config.data) : [],
      paramsKeys: config.params && typeof config.params === 'object' ? Object.keys(config.params) : [],
    })
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const config = response.config || {}
    const custom = config.custom || {}
    const trace = custom.debugTrace
    const body = parseResponseData(response.data)

    if (custom.loading) {
      hideLoading()
    }

    if (trace) {
      logRequestDebug('info', 'success', {
        id: trace.id,
        method: config.method,
        url: config.url,
        statusCode: response.statusCode,
        code: body?.code,
        message: body?.msg || body?.message || '',
        duration: Date.now() - trace.startTime,
      })
    }

    if (body && typeof body === 'object' && 'code' in body && body.code !== 1) {
      const error = new Error(resolveMessage(body, '请求失败'))
      error.data = body
      error.statusCode = response.statusCode
      error.config = config
      if (custom.toast !== false) $toast.show(error.message)
      return Promise.reject(error)
    }

    return body?.data ?? body
  },
  (error) => {
    const config = error?.config || {}
    const custom = config.custom || {}
    const trace = custom.debugTrace
    const body = parseResponseData(error?.data)
    const message = resolveMessage(body, error?.errMsg || (error?.statusCode ? `HTTP ${error.statusCode}` : '网络请求失败'))

    if (custom.loading) {
      hideLoading()
    }

    if (trace) {
      logRequestDebug('error', 'fail', {
        id: trace.id,
        method: config.method,
        url: config.url,
        requestUrl: trace.requestUrl,
        statusCode: error?.statusCode,
        errMsg: error?.errMsg,
        message,
        duration: Date.now() - trace.startTime,
      })
    }

    if (custom.toast !== false) $toast.show(message)

    const normalizedError = error instanceof Error ? error : new Error(message)
    normalizedError.message = message
    normalizedError.data = body
    normalizedError.statusCode = error?.statusCode
    normalizedError.config = config
    return Promise.reject(normalizedError)
  },
)

export const request = ({ url, method = 'GET', data = {}, params, header = {}, needToken = true, custom = {} }) =>
  http.request(
    normalizeConfig({
      url,
      method,
      data,
      params,
      header,
      needToken,
      custom,
    }),
  )

export const get = (url, params = {}, options = {}) =>
  http.get(
    url,
    normalizeConfig({
      ...options,
      params,
    }),
  )

export const post = (url, data = {}, options = {}) =>
  http.post(
    url,
    data,
    normalizeConfig(options),
  )

export const uploadFile = ({ url, filePath, name = 'file', formData = {}, header = {}, needToken = true, custom = {} }) =>
  http.upload(
    url,
    normalizeConfig({
      filePath,
      name,
      formData,
      header,
      needToken,
      custom: {
        loadingText: '上传中...',
        ...custom,
      },
    }),
  )
