<template>
  <view class="page">
    <view class="hero">
      <view class="user" @tap="handleLogin">
        <image class="avatar" :src="profile.avatar || '/static/logo.png'" mode="aspectFill"></image>
        <view class="user-copy">
          <text class="name">{{ isLoggedIn ? userLabel(profile) : '未登录' }}</text>
          <text class="meta">{{ isLoggedIn ? `user_id: ${profile.user_id || profile.id || '-'}` : '点击登录后获取个人信息' }}</text>
        </view>
      </view>
    </view>

    <view class="panel stats">
      <view class="stat">
        <text>{{ profile.score || 0 }}</text>
        <text>积分</text>
      </view>
      <view class="stat">
        <text>{{ profile.mobile || '-' }}</text>
        <text>手机号</text>
      </view>
      <view class="stat">
        <text>{{ profile.openid ? '已绑定' : '-' }}</text>
        <text>openid</text>
      </view>
    </view>

    <view class="panel menu">
      <view class="menu-item" @tap="go('/pages/address/index')">
        <text>地址管理</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="go('/pages/express/index')">
        <text>订单列表</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="loadProfile">
        <text>刷新个人信息</text>
        <text>></text>
      </view>
      <view v-if="isLoggedIn" class="menu-item danger" @tap="logout">
        <text>退出登录</text>
        <text>></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { userApi } from '@/services/api'
import { useUserStore } from '@/store'
import { userLabel } from '@/utils/api-fields'

const userStore = useUserStore()
const remoteProfile = ref({})
const isLoggedIn = computed(() => userStore.isLoggedIn)
const profile = computed(() => ({ ...(userStore.userInfo || {}), ...(remoteProfile.value || {}) }))

const go = (url) => {
  if (url === '/pages/express/index') uni.switchTab({ url })
  else uni.navigateTo({ url })
}

const handleLogin = () => {
  if (isLoggedIn.value) return
  uni.navigateTo({ url: '/pages/login/index?redirect=/pages/profile/index' })
}

const loadProfile = async () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  try {
    const data = await userApi.getUserInfo()
    remoteProfile.value = data || {}
    userStore.setUserInfo(data || {})
  } catch (error) {
    uni.showToast({ title: error.message || '个人信息加载失败', icon: 'none' })
  }
}

const logout = () => {
  userStore.logout()
  remoteProfile.value = {}
}

onMounted(() => {
  if (isLoggedIn.value) loadProfile()
})
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #f5f7fb;
}

.hero {
  padding: calc(var(--status-bar-height) + 64rpx) 32rpx 70rpx;
  background: linear-gradient(135deg, #d8e7ff 0%, #d9fff1 100%);
}

.user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #ffffff;
}

.user-copy {
  flex: 1;
  min-width: 0;
  margin-left: 26rpx;
}

.name {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 38rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: block;
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 25rpx;
}

.panel {
  margin: 24rpx 30rpx 0;
  border-radius: 14rpx;
  background: #ffffff;
}

.stats {
  padding: 32rpx 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.stat {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat text:first-child {
  max-width: 180rpx;
  overflow: hidden;
  color: #111827;
  font-size: 29rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat text:last-child {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.menu {
  padding: 0 24rpx;
}

.menu-item {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
  color: #111827;
  font-size: 28rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.danger {
  color: #ef4444;
}
</style>
