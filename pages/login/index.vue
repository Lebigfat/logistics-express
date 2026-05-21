<template>
  <view class="page">
    <AppHead title="登录" show-back></AppHead>
    <view class="card">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">微信授权登录</text>
      <text class="desc">登录后使用地址簿、下单、订单支付和物流查询</text>
      <button class="primary" :loading="loggingIn" :disabled="loggingIn" @tap="loginWithWechat">
        {{ loggingIn ? '登录中...' : '微信一键登录' }}
      </button>
      <!-- #ifdef MP-WEIXIN -->
      <button
        v-if="needBindMobile"
        class="secondary"
        :loading="bindingMobile"
        :disabled="bindingMobile"
        open-type="getPhoneNumber"
        @getphonenumber="bindMobile"
      >
        {{ bindingMobile ? '绑定中...' : '绑定手机号' }}
      </button>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppHead from '@/components/app-head/app-head.vue'
import { authApi } from '@/services/api'
import { API_BASE_URL } from '@/services/request'
import { useUserStore } from '@/store'
import { back, push, switchTab } from '@/utils/router'

const userStore = useUserStore()
const loggingIn = ref(false)
const bindingMobile = ref(false)
const userInfo = ref(null)
const redirectUrl = ref('')
const tabBarPaths = ['/pages/index/index', '/pages/express/index', '/pages/life/index', '/pages/profile/index']

const needBindMobile = computed(() => Boolean(userInfo.value?.openid && !userInfo.value?.mobile))

onLoad((options = {}) => {
  redirectUrl.value = options.redirect ? decodeURIComponent(options.redirect) : ''
  console.info('[login:onLoad]', {
    redirectUrl: redirectUrl.value,
    apiBaseURL: API_BASE_URL,
  })
})

const runUniApi = (name, options = {}) =>
  new Promise((resolve, reject) => {
    const startTime = Date.now()
    console.info(`[login:${name}:start]`, {
      provider: options.provider,
      desc: options.desc,
    })
    uni[name]({
      ...options,
      success: (res) => {
        console.info(`[login:${name}:success]`, {
          duration: Date.now() - startTime,
          hasCode: Boolean(res?.code),
          hasIv: Boolean(res?.iv),
          hasEncryptedData: Boolean(res?.encryptedData),
          errMsg: res?.errMsg,
        })
        resolve(res)
      },
      fail: (error) => {
        console.error(`[login:${name}:fail]`, {
          duration: Date.now() - startTime,
          errMsg: error?.errMsg,
          message: error?.message,
        })
        reject(error)
      },
    })
  })

const finishLogin = () => {
  uni.showToast({ title: '登录成功', icon: 'none' })
  setTimeout(() => {
    if (redirectUrl.value) {
      const targetPath = redirectUrl.value.split('?')[0].split('#')[0]
      if (tabBarPaths.includes(targetPath)) switchTab(targetPath)
      else push(redirectUrl.value)
      return
    }
    const pages = getCurrentPages()
    if (pages.length > 1) back()
    else switchTab('/pages/profile/index')
  }, 300)
}

const loginWithWechat = async () => {
  if (loggingIn.value) return
  loggingIn.value = true
  const startTime = Date.now()
  console.info('[login:wechat:start]', {
    api: '/api/user/weChatAppLogin',
  })
  try {
    // #ifdef MP-WEIXIN
    const profilePromise = runUniApi('getUserProfile', { desc: '用于完善会员资料' })
    const loginPromise = runUniApi('login', { provider: 'weixin' })
    const [profileRes, loginRes] = await Promise.all([profilePromise, loginPromise])
    console.info('[login:backend:start]', {
      api: '/api/user/weChatAppLogin',
      hasJsCode: Boolean(loginRes?.code),
      hasIv: Boolean(profileRes?.iv),
      hasEncryptedData: Boolean(profileRes?.encryptedData),
    })
    const data = await authApi.weChatAppLogin({
      js_code: loginRes.code,
      iv: profileRes.iv,
      encryptedData: profileRes.encryptedData,
    })
    userInfo.value = data?.userinfo || null
    userStore.setLoginInfo(data?.userinfo || data || {})
    if (!needBindMobile.value) finishLogin()
    else uni.showToast({ title: '请继续绑定手机号', icon: 'none' })
    // #endif
    console.info('[login:wechat:success]', {
      duration: Date.now() - startTime,
      hasUserInfo: Boolean(userInfo.value),
      needBindMobile: needBindMobile.value,
    })
  } catch (error) {
    console.error('[login:wechat:fail]', {
      duration: Date.now() - startTime,
      message: error?.message,
      errMsg: error?.errMsg,
      statusCode: error?.statusCode,
    })
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
  const startTime = Date.now()
  console.info('[login:bindMobile:start]', {
    api: '/api/user/bindMobile',
    hasPhoneCode: Boolean(code),
    hasOpenid: Boolean(userInfo.value?.openid),
  })
  try {
    const data = await authApi.bindMobile({ code, openid: userInfo.value.openid })
    userInfo.value = data?.userinfo || userInfo.value
    userStore.setLoginInfo(data?.userinfo || data || {})
    console.info('[login:bindMobile:success]', {
      duration: Date.now() - startTime,
      hasUserInfo: Boolean(userInfo.value),
    })
    finishLogin()
  } catch (error) {
    console.error('[login:bindMobile:fail]', {
      duration: Date.now() - startTime,
      message: error?.message,
      errMsg: error?.errMsg,
      statusCode: error?.statusCode,
    })
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

.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.card {
  margin: 80rpx 32rpx 0;
  padding: 54rpx 34rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16rpx;
  background: #ffffff;
}

.logo {
  width: 132rpx;
  height: 132rpx;
  border-radius: 28rpx;
}

.title {
  margin-top: 32rpx;
  color: #111827;
  font-size: 38rpx;
  font-weight: 800;
}

.desc {
  width: 520rpx;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 26rpx;
  line-height: 40rpx;
  text-align: center;
}

.primary,
.secondary {
  width: 100%;
  height: 88rpx;
  margin-top: 38rpx;
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 88rpx;
}

.primary {
  background: #438bff;
}

.secondary {
  margin-top: 24rpx;
  background: #10b981;
}
</style>
