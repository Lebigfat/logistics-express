export const $toast = {
  show(options = {}) {
    const config = typeof options === 'string' ? { title: options } : options
    uni.showToast({
      icon: 'none',
      duration: 2200,
      ...config,
      title: config.title || config.message || '',
    })
  },

  success(title) {
    this.show({ title, icon: 'success' })
  },

  error(title) {
    this.show({ title, icon: 'none' })
  },
}

export default $toast
