import { get, post, setStoredUser, uploadFile } from './request'

const saveLoginUser = (data) => {
  setStoredUser(data?.userinfo)
  return data
}

export const authApi = {
  weChatAppLogin(payload) {
    return post('/api/user/weChatAppLogin', payload, {
      needToken: false,
      custom: { debug: true },
    }).then(saveLoginUser)
  },
  bindMobile(payload) {
    return post('/api/user/bindMobile', payload, { needToken: false }).then(saveLoginUser)
  },
}

export const userApi = {
  getUserInfo() {
    return get('/api/user/getUserInfo')
  },
  updateUserInfo(payload) {
    return post('/api/user/userEditInfo', payload)
  },
  getNotice() {
    return get('/api/user/getNotice')
  },
  getNoticeDetail(id) {
    return get('/api/user/getNoticeDetail', { id })
  },
  getConfig(keyName) {
    return get('/api/user/getConfig', { keyName })
  },
  dataCount(params = {}) {
    return get('/api/user/dataCount', { page: 1, pageSize: 10, ...params })
  },
  dataCountExport(date) {
    return get('/api/user/dataCountExport', { date })
  },
}

export const addressApi = {
  list(params = {}) {
    return get('/api/user/getAddressAll', { page: 1, pageSize: 50, search: '', ...params })
  },
  parse(info) {
    return post('/api/address/parse', undefined, {
      needToken: false,
      params: { info },
    })
  },
  detail(id) {
    return get('/api/user/getAddressDetail', { id })
  },
  create(payload) {
    return post('/api/user/insertAddress', payload)
  },
  update(payload) {
    return post('/api/user/updateAddress', payload)
  },
  remove(id) {
    return post('/api/user/delAddress', { id })
  },
}

export const orderApi = {
  estimate(params) {
    return get('/api/user/getMoney', params)
  },
  create(payload) {
    return post('/api/user/placeAnOrder', payload)
  },
  list(params = {}) {
    return get('/api/user/getOrderList', { page: 1, pageSize: 10, tabType: '', ...params })
  },
  detail(id) {
    return get('/api/user/getOrderDetail', { id })
  },
  pay(id) {
    return post('/api/user/payOrder', { id })
  },
  logistics(id) {
    return get('/api/user/queryLogistics', { id })
  },
  cancel(id) {
    return post('/api/user/cancelOrder', { id })
  },
}

export const commonApi = {
  upload(filePath) {
    return uploadFile({ url: '/api/common/upload', filePath })
  },
}
