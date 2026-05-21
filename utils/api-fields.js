export const getRows = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

export const addressLine = (item = {}) =>
  [item.province, item.city, item.district, item.address].filter(Boolean).join(' ')

export const userLabel = (user = {}) => user.nickname || user.username || user.mobile || '未登录'

export const moneyText = (value) => Number(value || 0).toFixed(2)

export const timeText = (value) => {
  if (!value) return ''
  if (typeof value === 'number' || /^\d+$/.test(String(value))) {
    const date = new Date(Number(value) * 1000)
    if (!Number.isNaN(date.getTime())) {
      const pad = (num) => String(num).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  }
  return String(value)
}
