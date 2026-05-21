const PREFIX = 'XJY_'

const normalizeKey = (key) => `${PREFIX}${key}`

const storage = {
  get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(normalizeKey(key))
      if (value === '' || value === null || value === undefined) return defaultValue
      return value
    } catch (error) {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      uni.setStorageSync(normalizeKey(key), value)
      return true
    } catch (error) {
      return false
    }
  },

  remove(key) {
    try {
      uni.removeStorageSync(normalizeKey(key))
      return true
    } catch (error) {
      return false
    }
  },

  clear(keys = []) {
    try {
      if (!keys.length) {
        uni.clearStorageSync()
        return true
      }
      keys.forEach((key) => uni.removeStorageSync(normalizeKey(key)))
      return true
    } catch (error) {
      return false
    }
  },
}

export default storage
