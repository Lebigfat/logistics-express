<template>
  <view class="login-page">
    <AppHead title="登录" show-back></AppHead>

    <view class="login-hero">
      <image class="login-logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="login-title">小寄优快递</text>
      <text class="login-subtitle">登录后可使用地址簿、下单、订单支付和物流查询</text>
    </view>

    <view class="login-panel">
      <view class="login-tip">
        <text>将通过微信授权完成账号登录</text>
      </view>

      <button class="login-button" :loading="loggingIn" :disabled="loggingIn" @tap="loginWithWechat">
        {{ loggingIn ? '登录中...' : '微信一键登录' }}
      </button>

      <!-- #ifdef MP-WEIXIN -->
      <button
        v-if="needBindMobile"
        class="phone-button"
        :loading="bindingMobile"
        :disabled="bindingMobile"
        open-type="getPhoneNumber"
        @getphonenumber="bindMobile"
      >
        {{ bindingMobile ? '绑定中...' : '绑定手机号' }}
      </button>
      <!-- #endif -->

      <text class="login-note">登录即代表同意平台服务协议与隐私政策</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppHead from '@/components/app-head/app-head.vue'
import { authApi } from '@/services/api'

const loggingIn = ref(false)
const bindingMobile = ref(false)
const userInfo = ref(null)
const redirectUrl = ref('')

const needBindMobile = computed(() => Boolean(userInfo.value?.openid && !userInfo.value?.mobile))

onLoad((options = {}) => {
  redirectUrl.value = options.redirect ? decodeURIComponent(options.redirect) : ''
})

const runUniApi = (name, options = {}) =>
  new Promise((resolve, reject) => {
    uni[name]({
      ...options,
      success: resolve,
      fail: reject,
    })
  })

const finishLogin = () => {
  uni.showToast({ title: '登录成功', icon: 'none' })
  setTimeout(() => {
    if (redirectUrl.value) {
      uni.redirectTo({ url: redirectUrl.value })
      return
    }

    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.switchTab({ url: '/pages/profile/index' })
    }
  }, 300)
}

const loginWithWechat = async () => {
  if (loggingIn.value) return
  loggingIn.value = true

  try {
    // #ifdef MP-WEIXIN
    const loginRes = await runUniApi('login', { provider: 'weixin' })
    const profileRes = await runUniApi('getUserProfile', { desc: '用于完善会员资料' })
    const data = await authApi.weChatAppLogin({
      js_code: loginRes.code,
      iv: profileRes.iv,
      encryptedData: profileRes.encryptedData,
    })
    userInfo.value = data?.userinfo || null

    if (!needBindMobile.value) finishLogin()
    else uni.showToast({ title: '请继续绑定手机号', icon: 'none' })
    // #endif

    // #ifndef MP-WEIXIN
    uni.showToast({ title: '当前登录接口需要微信小程序环境', icon: 'none' })
    // #endif
  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loggingIn.value = false
  }
}

const bindMobile = async (event) => {
  const code = event?.detail?.code
  if (!code || !userInfo.value?.openid) {
    uni.showToast({ title: '手机号授权失败', icon: 'none' })
    return
  }

  bindingMobile.value = true
  try {
    const data = await authApi.bindMobile({ code, openid: userInfo.value.openid })
    userInfo.value = data?.userinfo || userInfo.value
    finishLogin()
  } catch (error) {
    uni.showToast({ title: error.message || '绑定失败', icon: 'none' })
  } finally {
    bindingMobile.value = false
  }
}
</script>

<style>
page {
  background: #f5f7fb;
}

.login-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #111827;
}

.login-hero {
  padding: 96rpx 48rpx 70rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  width: 132rpx;
  height: 132rpx;
  border-radius: 28rpx;
  background: #ffffff;
}

.login-title {
  margin-top: 30rpx;
  font-size: 42rpx;
  font-weight: 700;
}

.login-subtitle {
  width: 520rpx;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 27rpx;
  line-height: 42rpx;
  text-align: center;
}

.login-panel {
  margin: 0 34rpx;
  padding: 40rpx 30rpx 34rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.login-tip {
  min-height: 72rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background: #f3f8ff;
  color: #4b5563;
  font-size: 26rpx;
  box-sizing: border-box;
}

.login-button,
.phone-button {
  height: 88rpx;
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 700;
  line-height: 88rpx;
}

.login-button {
  background: #438bff;
}

.phone-button {
  background: #16a34a;
}

.login-button::after,
.phone-button::after {
  border: none;
}

.login-note {
  display: block;
  margin-top: 26rpx;
  color: #9ca3af;
  font-size: 23rpx;
  line-height: 34rpx;
  text-align: center;
}
</style>
