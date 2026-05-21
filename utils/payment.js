const isCancelPayment = (error = {}) => String(error.errMsg || error.message || '').includes('cancel')

export const requestWechatPayment = (payParam = {}) =>
  new Promise((resolve, reject) => {
    uni.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: resolve,
      fail: reject,
    })
  })

export const paymentErrorMessage = (error) => {
  if (isCancelPayment(error)) return '已取消支付'
  return error?.errMsg || error?.message || '支付失败'
}
