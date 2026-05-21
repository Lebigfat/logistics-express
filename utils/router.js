import { ensureLogin, isProtectedUrl } from '@/services/auth'

const tabBarPages = ['/pages/index/index', '/pages/express/index', '/pages/life/index', '/pages/profile/index']

const getPath = (url = '') => String(url).split('?')[0].split('#')[0]

const buildUrl = (to) => {
  if (typeof to === 'string') return to
  const query = to.query || {}
  const queryString = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null)
    .map((key) => `${key}=${encodeURIComponent(query[key])}`)
    .join('&')
  if (!queryString) return to.path
  return `${to.path}${to.path.includes('?') ? '&' : '?'}${queryString}`
}

const guardNavigate = async (url) => {
  if (!isProtectedUrl(url)) return true
  return ensureLogin({ redirectUrl: url })
}

export const isTabBarPage = (url) => tabBarPages.includes(getPath(url))

export const push = async (to) => {
  const url = buildUrl(to)
  if (!(await guardNavigate(url))) return undefined
  if (isTabBarPage(url)) return uni.switchTab({ url: getPath(url) })
  return uni.navigateTo({ url })
}

export const switchTab = async (to) => {
  const url = buildUrl(to)
  if (!(await guardNavigate(url))) return undefined
  return uni.switchTab({ url: getPath(url) })
}

export const redirectTo = async (to) => {
  const url = buildUrl(to)
  if (!(await guardNavigate(url))) return undefined
  if (isTabBarPage(url)) return uni.switchTab({ url: getPath(url) })
  return uni.redirectTo({ url })
}

export const reLaunch = async (to) => {
  const url = buildUrl(to)
  if (!(await guardNavigate(url))) return undefined
  if (isTabBarPage(url)) return uni.switchTab({ url: getPath(url) })
  return uni.reLaunch({ url })
}

export const back = (delta = 1) => {
  const pages = getCurrentPages()
  if (pages.length > delta) return uni.navigateBack({ delta })
  return switchTab('/pages/index/index')
}

export default {
  push,
  switchTab,
  redirectTo,
  reLaunch,
  back,
  isTabBarPage,
}
