import { request, setStoredUser, uploadFile } from './request'

export const authApi = {
  weChatAppLogin(payload) {
    return request({ url: '/api/user/weChatAppLogin', method: 'POST', data: payload, needToken: false }).then((data) => {
      setStoredUser(data?.userinfo)
      return data
    })
  },
  bindMobile(payload) {
    return request({ url: '/api/user/bindMobile', method: 'POST', data: payload, needToken: false }).then((data) => {
      setStoredUser(data?.userinfo)
      return data
    })
  },
}

export const userApi = {
  getUserInfo() {
    return request({ url: '/api/user/getUserInfo' })
  },
  updateUserInfo(payload) {
    return request({ url: '/api/user/userEditInfo', method: 'POST', data: payload })
  },
  getNotice() {
    return request({ url: '/api/user/getNotice' })
  },
  getConfig(keyName) {
    return request({ url: '/api/user/getConfig', data: { keyName } })
  },
  dataCount(params = {}) {
    return request({ url: '/api/user/dataCount', data: { page: 1, pageSize: 10, ...params } })
  },
}

export const addressApi = {
  list(params = {}) {
    return request({ url: '/api/user/getAddressAll', data: { page: 1, pageSize: 50, search: '', ...params } })
  },
  parse(info) {
    return request({ url: `/api/address/parse?info=${encodeURIComponent(info)}`, method: 'POST', needToken: false })
  },
  detail(id) {
    return request({ url: '/api/user/getAddressDetail', data: { id } })
  },
  create(payload) {
    return request({ url: '/api/user/insertAddress', method: 'POST', data: payload })
  },
  update(payload) {
    return request({ url: '/api/user/updateAddress', method: 'POST', data: payload })
  },
  remove(id) {
    return request({ url: '/api/user/delAddress', method: 'POST', data: { id } })
  },
}

export const orderApi = {
  estimate(params) {
    return request({ url: '/api/user/getMoney', data: params })
  },
  create(payload) {
    return request({ url: '/api/user/placeAnOrder', method: 'POST', data: payload })
  },
  list(params = {}) {
    return request({ url: '/api/user/getOrderList', data: { page: 1, pageSize: 10, tabType: '', ...params } })
  },
  detail(id) {
    return request({ url: '/api/user/getOrderDetail', data: { id } })
  },
  pay(id) {
    return request({ url: '/api/user/payOrder', method: 'POST', data: { id } })
  },
  logistics(id) {
    return request({ url: '/api/user/queryLogistics', data: { id } })
  },
  cancel(id) {
    return request({ url: '/api/user/cancelOrder', method: 'POST', data: { id } })
  },
}

export const commonApi = {
  upload(filePath) {
    return uploadFile({ url: '/api/common/upload', filePath })
  },
}
