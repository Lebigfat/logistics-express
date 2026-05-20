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
          <view class="sync-tag">{{ isLoggedIn ? '已登录' : '去登录' }}</view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || '微信用户...' }}</text>
          <text class="login-state">{{ isLoggedIn ? '已登录' : '未登录' }}</text>
          <view class="invite-row">
            <text class="invite-text">邀请码:{{ inviteCode }}</text>
            <view class="copy-btn" @tap="copyCode">复制</view>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <view v-if="!isLoggedIn" class="login-entry" @tap="goLogin">
        <text>去登录</text>
        <UvIcon name="arrow-right" color="#ffffff" size="18"></UvIcon>
      </view>

      <view class="quick-card">
        <view v-for="item in quickItems" :key="item.title" class="quick-item" @tap="go(item.url)">
          <view class="quick-icon">{{ item.icon }}</view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="invite-banner">
        <text>邀请好友下单升级，立享更多折扣</text>
        <view class="partner-btn" @tap="go('/pages/share/index')">查询合伙人权益</view>
      </view>

      <view class="wallet-card">
        <view class="card-head">
          <text class="card-title">我的钱包</text>
          <view class="detail-link">
            <text>查看明细</text>
            <UvIcon name="arrow-right" color="#9a9a9a" size="20"></UvIcon>
          </view>
        </view>
        <view class="wallet-row">
          <view v-for="item in walletItems" :key="item.label" class="wallet-item">
            <text class="wallet-value">{{ item.value }}</text>
            <text class="wallet-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="function-card">
        <text class="card-title">我的功能</text>
        <view class="function-grid">
          <view v-for="item in functionItems" :key="item.title" class="function-item">
            <view class="function-icon">{{ item.icon }}</view>
            <text>{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { getStoredUser } from '@/services/request'
import { userApi } from '@/services/api'

const userInfo = ref(getStoredUser() || {})
const isLoggedIn = computed(() => Boolean(userInfo.value?.token))
const inviteCode = computed(() => userInfo.value.user_id || userInfo.value.id || '103794242')

const quickItems = [
  { title: '优惠券', icon: '券', url: '/pages/coupon/index' },
  { title: '地址管理', icon: '⌖', url: '/pages/address/index' },
  { title: '费用补即', icon: '$' },
  { title: '邀请好友', icon: '✓', url: '/pages/share/index' },
]

const walletItems = computed(() => [
  { label: '余额', value: userInfo.value.money || '0' },
  { label: '待入账', value: userInfo.value.pending_money || '0' },
  { label: '提现次数', value: userInfo.value.withdraw_count || '0' },
])

const functionItems = [
  { title: '余额提现', icon: '$' },
  { title: '团队列表', icon: '◉' },
  { title: '佣金规则', icon: '?' },
  { title: '填写邀请码', icon: '⌖' },
  { title: '团队订单', icon: '◈' },
  { title: '搜索上级', icon: '⌕' },
  { title: '设置', icon: '⚙' },
  { title: '联系客服', icon: '◎' },
]

const go = (url) => {
  if (url) uni.navigateTo({ url })
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const copyCode = () => {
  uni.setClipboardData({ data: String(inviteCode.value) })
}

const loadUserInfo = async () => {
  if (!isLoggedIn.value) return
  try {
    userInfo.value = await userApi.getUserInfo()
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

.sync-tag {
  position: absolute;
  left: 10rpx;
  bottom: 0;
  height: 26rpx;
  padding: 0 8rpx;
  border-radius: 14rpx;
  background: #f4cf91;
  color: #8e5a16;
  font-size: 18rpx;
  line-height: 26rpx;
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
  margin-top: 20rpx;
  display: flex;
  align-items: center;
}

.invite-text {
  color: #96989c;
  font-size: 24rpx;
}

.copy-btn {
  height: 34rpx;
  margin-left: 10rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid #9a9a9a;
  border-radius: 8rpx;
  color: #8f9296;
  font-size: 24rpx;
  box-sizing: border-box;
}

.content {
  margin-top: -30rpx;
  padding: 0 30rpx 30rpx;
}

.login-entry,
.quick-card,
.wallet-card,
.function-card {
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.login-entry {
  height: 84rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #438bff;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.quick-card {
  height: 176rpx;
  padding: 30rpx 24rpx 18rpx;
  display: flex;
  justify-content: space-between;
}

.quick-item {
  width: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25rpx;
}

.quick-icon {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;
  font-size: 36rpx;
  font-weight: 700;
}

.quick-item text {
  margin-top: 18rpx;
}

.invite-banner {
  height: 96rpx;
  margin-top: 24rpx;
  padding: 0 22rpx 0 26rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background: #eaded7;
  box-sizing: border-box;
}

.invite-banner text {
  flex: 1;
  min-width: 0;
  color: #8d541d;
  font-size: 27rpx;
  white-space: nowrap;
}

.partner-btn {
  width: 208rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 34rpx;
  background: #0d0d0d;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}

.wallet-card {
  height: 240rpx;
  margin-top: 24rpx;
  padding: 34rpx 34rpx 0;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
}

.detail-link {
  display: flex;
  align-items: center;
  color: #9a9a9a;
  font-size: 25rpx;
}

.wallet-row {
  margin-top: 42rpx;
  display: flex;
}

.wallet-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wallet-value {
  font-size: 32rpx;
}

.wallet-label {
  margin-top: 18rpx;
  color: #9b9b9b;
  font-size: 24rpx;
}

.function-card {
  margin-top: 24rpx;
  padding: 36rpx 34rpx 22rpx;
}

.function-grid {
  margin-top: 34rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 28rpx;
}

.function-item {
  height: 122rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24rpx;
}

.function-icon {
  width: 58rpx;
  height: 58rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 34rpx;
  font-weight: 700;
}
</style>
