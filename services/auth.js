import { getToken } from './request'

const LOGIN_PAGE = '/pages/login/index'
const PROTECTED_PREFIXES = ['/pages/send/index', '/pages/address/index', '/pages/express/index']
const ORIGINAL_KEY = '__xjy_auth_originals__'
let installed = false

const getOriginalMethod = (name) => uni[ORIGINAL_KEY]?.[name]
const getPath = (url) => String(url || '').split('?')[0].split('#')[0]

export const isLoggedIn = () => Boolean(getToken())

export const isProtectedUrl = (url) => {
  const path = getPath(url)
  if (!path || path === LOGIN_PAGE) return false
  return PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export const buildLoginUrl = (redirectUrl = '') => {
  if (!redirectUrl) return LOGIN_PAGE
  return `${LOGIN_PAGE}?redirect=${encodeURIComponent(redirectUrl)}`
}

export const goLogin = (redirectUrl = '') => {
  const navigateTo = getOriginalMethod('navigateTo') || uni.navigateTo
  return navigateTo({ url: buildLoginUrl(redirectUrl) })
}

export const ensureLogin = ({ redirectUrl = '', title = '需要登录', content = '请先登录后再使用。' } = {}) =>
  new Promise((resolve) => {
    if (isLoggedIn()) {
      resolve(true)
      return
    }
    uni.showModal({
      title,
      content,
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) goLogin(redirectUrl)
        resolve(false)
      },
      fail: () => resolve(false),
    })
  })

export const withLoginGuard = (handler, options = {}) => {
  return async (...args) => {
    const allowed = await ensureLogin(options)
    if (!allowed) return undefined
    return handler?.(...args)
  }
}

const wrapNavigationMethod = (name) => {
  const original = uni[name]
  if (typeof original !== 'function') return

  uni[ORIGINAL_KEY] = uni[ORIGINAL_KEY] || {}
  if (!uni[ORIGINAL_KEY][name]) {
    uni[ORIGINAL_KEY][name] = original.bind(uni)
  }

  uni[name] = (options = {}) => {
    const url = typeof options === 'string' ? options : options?.url || ''
    if (url && isProtectedUrl(url) && !isLoggedIn()) {
      ensureLogin({ redirectUrl: url })
      return Promise.resolve()
    }
    return uni[ORIGINAL_KEY][name](options)
  }
}

export const installAuthNavigationGuard = () => {
  if (installed) return
  installed = true
  wrapNavigationMethod('navigateTo')
  wrapNavigationMethod('redirectTo')
  wrapNavigationMethod('reLaunch')
  wrapNavigationMethod('switchTab')
}
