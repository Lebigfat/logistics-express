<template>
  <view class="profile-page">
    <view class="hero">
      <view class="capsule">
        <UvIcon name="more-dot-fill" color="#000000" size="22"></UvIcon>
        <view class="capsule-line"></view>
        <view class="capsule-circle"></view>
      </view>

      <view class="user-row">
        <view class="avatar-wrap" @tap="goLogin">
          <image v-if="userInfo.avatar" class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
          <view v-else class="avatar">
            <view class="avatar-head"></view>
            <view class="avatar-body"></view>
          </view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || 'Guest' }}</text>
          <text class="login-state">{{ isLoggedIn ? 'Logged in' : 'Tap to login' }}</text>
          <view class="invite-row">
            <text class="invite-text">Code: {{ inviteCode }}</text>
            <view class="copy-btn" @tap="copyCode">Copy</view>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <view v-if="!isLoggedIn" class="login-entry" @tap="goLogin">
        <text>Login</text>
        <UvIcon name="arrow-right" color="#ffffff" size="18"></UvIcon>
      </view>

      <view class="quick-card">
        <view v-for="item in quickItems" :key="item.title" class="quick-item" @tap="go(item.url)">
          <view class="quick-icon">{{ item.icon }}</view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="wallet-card">
        <view class="card-head">
          <text class="card-title">Wallet</text>
        </view>
        <view class="wallet-row">
          <view v-for="item in walletItems" :key="item.label" class="wallet-item">
            <text class="wallet-value">{{ item.value }}</text>
            <text class="wallet-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { useUserStore } from '@/store'
import { push } from '@/utils/router'
import { userApi } from '@/services/api'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})
const isLoggedIn = computed(() => userStore.isLoggedIn)
const inviteCode = computed(() => userInfo.value.user_id || userInfo.value.id || '103794242')

const quickItems = [
  { title: 'Coupons', icon: 'C', url: '/pages/coupon/index' },
  { title: 'Address', icon: 'A', url: '/pages/address/index' },
  { title: 'Share', icon: 'S', url: '/pages/share/index' },
  { title: 'Profile', icon: 'P' },
]

const walletItems = computed(() => [
  { label: 'Balance', value: userInfo.value.money || '0' },
  { label: 'Pending', value: userInfo.value.pending_money || '0' },
  { label: 'Withdraws', value: userInfo.value.withdraw_count || '0' },
])

const go = (url) => {
  if (url) push(url)
}

const goLogin = () => {
  push('/pages/login/index')
}

const copyCode = () => {
  uni.setClipboardData({ data: String(inviteCode.value) })
}

const loadUserInfo = async () => {
  if (!isLoggedIn.value) return
  try {
    const data = await userApi.getUserInfo()
    userStore.setUserInfo(data || {})
  } catch (error) {
    console.warn('load user info failed', error)
  }
}

onMounted(loadUserInfo)
</script>

<style>
page {
  background: #f5fbff;
}

.profile-page {
  min-height: 100vh;
  padding-bottom: calc(112rpx + env(safe-area-inset-bottom));
  background: #f5fbff;
  color: #2c2d30;
}

.hero {
  height: 388rpx;
  padding: calc(var(--status-bar-height) + 32rpx) 30rpx 0;
  background: linear-gradient(135deg, #b9cdfb 0%, #d9eff8 54%, #c5f3de 100%);
  box-sizing: border-box;
}

.capsule {
  width: 174rpx;
  height: 64rpx;
  margin-left: auto;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 34rpx;
  background: #eaf8f5;
  box-sizing: border-box;
}

.capsule-line {
  width: 1rpx;
  height: 36rpx;
  background: #b8c8c6;
}

.capsule-circle {
  width: 42rpx;
  height: 42rpx;
  border: 8rpx solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
}

.user-row {
  margin-top: 36rpx;
  padding-left: 28rpx;
  display: flex;
  align-items: center;
}

.avatar-wrap {
  width: 120rpx;
  height: 136rpx;
  position: relative;
}

.avatar,
.avatar-img {
  width: 120rpx;
  height: 120rpx;
  overflow: hidden;
  position: relative;
  border: 2rpx solid #ffffff;
  border-radius: 50%;
  background: #c6c6c6;
  box-sizing: border-box;
}

.avatar-img {
  display: block;
}

.avatar-head {
  position: absolute;
  left: 38rpx;
  top: 32rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #f4f4f4;
}

.avatar-body {
  position: absolute;
  left: 24rpx;
  bottom: -12rpx;
  width: 72rpx;
  height: 54rpx;
  border-radius: 42rpx 42rpx 0 0;
  background: #f4f4f4;
}

.user-info {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.user-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}

.login-state {
  display: block;
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 22rpx;
}

.invite-row {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.invite-text {
  font-size: 22rpx;
  color: #4b5563;
}

.copy-btn {
  height: 40rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
}

.content {
  margin-top: -46rpx;
  padding: 0 24rpx;
}

.login-entry,
.wallet-card,
.quick-card {
  border-radius: 18rpx;
  background: #ffffff;
}

.login-entry {
  height: 88rpx;
  margin-bottom: 22rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #438bff 0%, #5ea7ff 100%);
  color: #ffffff;
}

.quick-card {
  padding: 22rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  font-size: 22rpx;
}

.quick-icon {
  width: 66rpx;
  height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: #eef4ff;
}

.wallet-card {
  margin-top: 22rpx;
  padding: 24rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 28rpx;
  font-weight: 700;
}

.wallet-row {
  margin-top: 20rpx;
  display: flex;
}

.wallet-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.wallet-value {
  font-size: 30rpx;
  font-weight: 700;
}

.wallet-label {
  font-size: 22rpx;
  color: #6b7280;
}
</style>
