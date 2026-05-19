<template>
  <view class="page">
    <view class="hero">
      <view class="status-space"></view>
      <view class="top-row">
        <text class="brand">寄速通</text>
        <view class="capsule">
          <UvIcon name="more-dot-fill" color="#000000" size="22"></UvIcon>
          <view class="capsule-line"></view>
          <view class="capsule-circle"></view>
        </view>
      </view>

      <view class="search-box">
        <UvIcon name="scan" color="#438bff" size="24"></UvIcon>
        <view class="search-divider"></view>
        <input
          v-model="searchNo"
          class="search-input"
          placeholder="输入要查询的单号或扫码单号"
          placeholder-class="search-placeholder"
          confirm-type="search"
        />
        <UvIcon name="search" color="#666666" size="28"></UvIcon>
      </view>

      <view class="quick-panel">
        <view class="primary-card" @tap="go('/pages/send/index')">
          <view class="primary-top">
            <view class="paper-icon">
              <text>➤</text>
            </view>
            <view>
              <text class="quick-title">寄快递</text>
              <text class="quick-desc">寄全国5元起</text>
            </view>
          </view>
          <view class="ai-row">
            <text>AI自动全网比价</text>
            <UvIcon name="arrow-right" color="#ffffff" size="16"></UvIcon>
          </view>
          <view class="brand-dots">
            <text v-for="item in courierDots" :key="item.name" :style="{ backgroundColor: item.color }">{{ item.name }}</text>
          </view>
        </view>

        <view class="side-actions">
          <view class="side-card" @tap="go('/pages/send/index?tab=large')">
            <view class="side-icon blue">▣</view>
            <view>
              <text class="side-title">寄大件</text>
              <text class="side-desc">30公斤起重货邮寄</text>
            </view>
          </view>
          <view class="side-card" @tap="go('/pages/moving/index')">
            <view class="side-icon green">▰</view>
            <view>
              <text class="side-title">同城送货</text>
              <text class="side-desc">同城跨城都便宜</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="main">
      <view class="tool-grid">
        <view v-for="item in tools" :key="item.title" class="tool-item" @tap="go(item.url)">
          <view v-if="item.badge" class="tool-badge">{{ item.badge }}</view>
          <view class="tool-icon" :class="item.tone">{{ item.icon }}</view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="notice-card">
        <view class="notice-icon">▸</view>
        <text class="notice-text">恭喜李某某获得0.76元奖励，</text>
        <text class="notice-link" @tap="go('/pages/share/index')">点击分享返佣</text>
      </view>

      <view class="promo-banner">
        <view class="promo-copy">
          <text class="promo-tag">当天上门</text>
          <text class="promo-title">寄件就用云优寄</text>
          <view class="promo-row">
            <text>全国低至</text>
            <text class="promo-price">5</text>
            <text>元起!</text>
          </view>
        </view>
        <view class="parcel-stack">
          <view class="pin"></view>
          <view class="parcel big"></view>
          <view class="parcel mid"></view>
          <view class="parcel small"></view>
          <view class="list-card">
            <view></view>
            <view></view>
            <view></view>
          </view>
        </view>
      </view>

      <view class="follow-bar" v-if="showFollow">
        <view class="close" @tap="showFollow = false">×</view>
        <text>关注公众号，领优惠券再加平台返利</text>
        <view class="follow-btn">去关注</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const searchNo = ref('')
const showFollow = ref(true)

const courierDots = [
  { name: 'YT', color: '#5b2b74' },
  { name: 'ZTO', color: '#159ce8' },
  { name: 'Y', color: '#ffb400' },
  { name: 'STO', color: '#6d6d6d' },
  { name: 'J&T', color: '#f01f2f' },
]

const tools = [
  { title: '查运费', icon: '⌕', tone: 'cyan', url: '/pages/send/index' },
  { title: '同城闪送', icon: '↗', tone: 'blue', url: '/pages/moving/index' },
  { title: '寄冷链', icon: '❄', tone: 'green', url: '/pages/send/index' },
  { title: '商家寄件', icon: '▰', tone: 'blue', url: '/pages/send/index?tab=business' },
  { title: '分享返佣', icon: '¥', tone: 'cyan', badge: '去赚钱', url: '/pages/share/index' },
  { title: '费用补缴', icon: '▱', tone: 'blue', url: '/pages/profile/index' },
  { title: '批量寄件', icon: '▤', tone: 'green', url: '/pages/send/index?tab=batch' },
  { title: '意见反馈', icon: '☰', tone: 'blue', url: '/pages/profile/index' },
]

const go = (url) => {
  if (!url) return
  if (url.includes('/pages/profile') || url.includes('/pages/express') || url.includes('/pages/life')) {
    uni.switchTab({ url })
    return
  }
  uni.navigateTo({ url })
}
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
  background: #f5f7fb;
  color: #2c2d30;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
}

.hero {
  padding: 0 30rpx 88rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #f5f7fb 100%),
    linear-gradient(120deg, #4e86ff 0%, #77b9f0 50%, #2fd7b8 100%);
}

.status-space {
  height: calc(var(--status-bar-height) + 48rpx);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #ffffff;
  font-size: 46rpx;
  font-weight: 700;
}

.capsule {
  width: 174rpx;
  height: 64rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.62);
  box-sizing: border-box;
}

.capsule-line {
  width: 1rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.18);
}

.capsule-circle {
  width: 42rpx;
  height: 42rpx;
  border: 8rpx solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
}

.search-box {
  height: 88rpx;
  margin-top: 42rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(34, 80, 140, 0.08);
  box-sizing: border-box;
}

.search-divider {
  width: 1rpx;
  height: 32rpx;
  margin: 0 22rpx;
  background: #d4d7df;
}

.search-input {
  flex: 1;
  height: 88rpx;
  color: #333333;
  font-size: 27rpx;
}

.search-placeholder {
  color: #b7beca;
}

.quick-panel {
  margin-top: 32rpx;
  display: flex;
  gap: 18rpx;
}

.primary-card {
  flex: 1;
  height: 310rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #4688f8;
  color: #ffffff;
}

.primary-top {
  height: 142rpx;
  padding: 32rpx 24rpx 0;
  display: flex;
  box-sizing: border-box;
}

.paper-icon {
  width: 78rpx;
  height: 78rpx;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.26);
  font-size: 42rpx;
}

.quick-title,
.quick-desc,
.side-title,
.side-desc {
  display: block;
}

.quick-title {
  font-size: 32rpx;
  font-weight: 700;
}

.quick-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
}

.ai-row {
  padding: 30rpx 24rpx 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.18);
  font-size: 30rpx;
  box-sizing: border-box;
}

.brand-dots {
  height: 78rpx;
  padding-left: 24rpx;
  display: flex;
  align-items: center;
  gap: 7rpx;
  background: rgba(255, 255, 255, 0.18);
}

.brand-dots text {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 13rpx;
  font-weight: 800;
}

.side-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.side-card {
  height: 147rpx;
  padding: 32rpx 24rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.side-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  color: #ffffff;
  font-size: 34rpx;
}

.side-title {
  font-size: 31rpx;
  font-weight: 700;
}

.side-desc {
  margin-top: 8rpx;
  color: #8e99aa;
  font-size: 22rpx;
}

.main {
  margin-top: -46rpx;
  padding: 0 30rpx 120rpx;
}

.tool-grid {
  padding: 36rpx 20rpx 26rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 28rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(26, 72, 130, 0.06);
}

.tool-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333333;
  font-size: 22rpx;
}

.tool-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.tool-badge {
  position: absolute;
  top: -18rpx;
  right: 4rpx;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 18rpx 18rpx 18rpx 0;
  background: #ff5b24;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 34rpx;
}

.blue {
  background: linear-gradient(135deg, #6fa4ff, #438bff);
}

.green {
  background: linear-gradient(135deg, #79e8c6, #12caa2);
}

.cyan {
  background: linear-gradient(135deg, #62d7ff, #4a8cff);
}

.notice-card {
  height: 80rpx;
  margin-top: 28rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 26rpx rgba(26, 72, 130, 0.06);
}

.notice-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #6e9dff;
  color: #ffffff;
}

.notice-text,
.notice-link {
  font-size: 27rpx;
}

.notice-link {
  color: #438bff;
}

.promo-banner {
  height: 292rpx;
  margin-top: 28rpx;
  padding: 64rpx 52rpx;
  position: relative;
  overflow: hidden;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #d8ffe6 0%, #9cddff 52%, #c3d3ff 100%);
  box-sizing: border-box;
}

.promo-copy {
  position: relative;
  z-index: 2;
}

.promo-tag {
  width: 126rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: linear-gradient(90deg, #2e78ff, #42c5ff);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
}

.promo-title {
  display: block;
  margin-top: 28rpx;
  color: #071018;
  font-size: 42rpx;
  font-weight: 900;
}

.promo-row {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  color: #071018;
  font-size: 24rpx;
  font-weight: 800;
}

.promo-price {
  margin: 0 4rpx;
  color: #ff4b00;
  font-size: 40rpx;
}

.parcel-stack {
  position: absolute;
  right: 32rpx;
  bottom: 30rpx;
  width: 260rpx;
  height: 190rpx;
}

.pin {
  position: absolute;
  right: 80rpx;
  top: 0;
  width: 48rpx;
  height: 66rpx;
  border-radius: 50% 50% 50% 0;
  background: #ff4f61;
  transform: rotate(-45deg);
}

.parcel {
  position: absolute;
  border-radius: 8rpx;
  background: #ffd066;
  box-shadow: inset 0 -10rpx 0 rgba(195, 110, 0, 0.18);
}

.parcel.big {
  right: 48rpx;
  bottom: 0;
  width: 96rpx;
  height: 106rpx;
}

.parcel.mid {
  right: 128rpx;
  bottom: 0;
  width: 76rpx;
  height: 76rpx;
  background: #ffc455;
}

.parcel.small {
  right: 6rpx;
  bottom: 12rpx;
  width: 64rpx;
  height: 64rpx;
  background: #ffb948;
}

.list-card {
  position: absolute;
  left: 8rpx;
  bottom: 12rpx;
  width: 70rpx;
  height: 78rpx;
  padding: 14rpx 10rpx;
  border-radius: 10rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.list-card view {
  height: 8rpx;
  margin-bottom: 10rpx;
  border-radius: 8rpx;
  background: #438bff;
}

.follow-bar {
  height: 72rpx;
  margin-top: 28rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 38rpx;
  background: rgba(68, 68, 68, 0.78);
  color: #ffffff;
  box-sizing: border-box;
}

.close {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  line-height: 40rpx;
}

.follow-bar text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  width: 126rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 26rpx;
  background: #438bff;
  font-size: 25rpx;
  font-weight: 700;
}
</style>
