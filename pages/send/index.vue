<template>
  <view class="send-page">
    <view class="phone-status">
      <text>9:41</text>
      <view class="status-icons">
        <view class="signal"></view>
        <view class="wifi"></view>
        <view class="battery"></view>
      </view>
    </view>

    <view class="nav-bar">
      <view class="nav-icon" @tap="goBack">
        <UvIcon name="arrow-left" color="#1f2937" size="21"></UvIcon>
      </view>
      <text class="nav-title">寄快递</text>
      <view class="capsule">
        <UvIcon name="more-dot-fill" color="#111827" size="21"></UvIcon>
        <view class="capsule-divider"></view>
        <view class="mini-circle"></view>
      </view>
    </view>

    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab"
        class="tab-item"
        :class="{ active: activeTab === tab }"
        @tap="activeTab = tab"
      >
        <text>{{ tab }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="address-card">
        <view class="address-line">
          <view class="step">
            <view class="step-dot sender">寄</view>
            <view class="step-wire"></view>
          </view>
          <view class="address-copy">
            <text class="address-title">寄件人信息</text>
            <text class="address-desc">请输入真实姓名</text>
          </view>
          <text class="book-link">地址簿</text>
        </view>
        <view class="address-divider"></view>
        <view class="address-line">
          <view class="step">
            <view class="step-dot receiver">收</view>
          </view>
          <view class="address-copy">
            <text class="address-title">收件人信息</text>
            <text class="address-desc">支持地址粘贴、图片识别</text>
          </view>
          <text class="book-link">地址簿</text>
        </view>
      </view>

      <view class="info-card">
        <view class="cell head-cell">
          <view class="cell-left">
            <text class="cell-title">物品信息</text>
            <text class="required">必填</text>
          </view>
          <UvIcon name="arrow-right" color="#1f2937" size="18"></UvIcon>
        </view>
        <view class="cell">
          <text class="cell-title">快递重量（kg）</text>
          <view class="stepper">
            <text class="stepper-btn">-</text>
            <text class="stepper-value">2</text>
            <text class="stepper-btn">+</text>
          </view>
        </view>
        <view class="cell">
          <text class="cell-title">优惠券</text>
          <view class="cell-right">
            <text>未使用</text>
            <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
          </view>
        </view>
        <view class="cell last">
          <text class="cell-title">备注</text>
          <view class="cell-right">
            <text>选填</text>
            <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
          </view>
        </view>
      </view>

      <view class="courier-card">
        <view
          v-for="item in couriers"
          :key="item.name"
          class="courier-row"
          :class="{ selected: selectedCourier === item.name }"
          @tap="selectedCourier = item.name"
        >
          <view class="logo" :style="{ backgroundColor: item.color, color: item.textColor || '#ffffff' }">
            <text>{{ item.logo }}</text>
          </view>
          <view class="courier-main">
            <view class="courier-name-row">
              <text class="courier-name">{{ item.name }}</text>
              <text v-if="item.badge" class="badge">{{ item.badge }}</text>
            </view>
            <view class="price-row">
              <text>预估价格：</text>
              <text class="price">{{ item.price }}元起</text>
            </view>
            <text class="tag">{{ item.tag }}</text>
          </view>
          <view class="radio" :class="{ checked: selectedCourier === item.name }">
            <UvIcon v-if="selectedCourier === item.name" name="checkmark" color="#ffffff" size="14" bold></UvIcon>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="notice">注:所有费用都在平台完成，无需向快递员额外付费</view>
      <view class="submit-row">
        <view class="fee">
          <view class="fee-line">
            <text>运费：</text>
            <text class="fee-price">￥3980</text>
          </view>
          <view class="agree">
            <view class="agree-dot">
              <UvIcon name="checkmark" color="#ffffff" size="9" bold></UvIcon>
            </view>
            <text>我已阅读并同意</text>
            <text class="protocol">《寄件服务协议》</text>
          </view>
        </view>
        <view class="submit-button">立即下单</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const tabs = ['寄快递', '批量寄件', '寄大件', '寄得物仓', '商家寄件']
const activeTab = ref('寄快递')
const selectedCourier = ref('圆通')

const couriers = [
  { name: '圆通', logo: 'YT', color: '#5d2d82', badge: '推荐', price: 5, tag: '极力推荐，取件较好，上门及时' },
  { name: '韵达', logo: 'Y', color: '#ffcf23', textColor: '#111827', price: 5, tag: '官方渠道，取件较好，效率高' },
  { name: '中通快递', logo: 'ZTO', color: '#2fa7ff', price: 5, tag: '全国经营，价格优惠' },
  { name: '申通快递', logo: 'sto', color: '#737373', price: 5, tag: '平台补贴体验' },
  { name: '菜鸟快递', logo: '菜', color: '#0398ff', price: 8, tag: '菜鸟直营，2小时内上门' },
  { name: '极兔快递', logo: 'J&T', color: '#ef2b2d', price: 5, tag: '适合分区内，超强外派的单品' },
  { name: '京东快递', logo: 'JD', color: '#eb3b32', price: 7, tag: '京东自营，当天揽收' },
]

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.switchTab({
    url: '/pages/index/index',
  })
}
</script>

<style>
page {
  background: #f3f4f6;
}

.send-page {
  min-height: 100vh;
  position: relative;
  background: #f3f4f6;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
}

.phone-status {
  height: 42rpx;
  padding: 0 50rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  background: #ffffff;
  box-sizing: border-box;
  color: #111827;
  font-size: 24rpx;
  font-weight: 700;
}

.status-icons {
  height: 24rpx;
  display: flex;
  align-items: center;
}

.signal {
  width: 28rpx;
  height: 18rpx;
  margin-right: 8rpx;
  background: linear-gradient(90deg, #111827 20%, transparent 20% 30%, #111827 30% 50%, transparent 50% 60%, #111827 60% 80%, transparent 80%);
  border-radius: 2rpx;
}

.wifi {
  width: 24rpx;
  height: 18rpx;
  margin-right: 8rpx;
  border: 4rpx solid #111827;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
}

.battery {
  width: 36rpx;
  height: 18rpx;
  border: 3rpx solid #111827;
  border-radius: 5rpx;
  position: relative;
  box-sizing: border-box;
}

.battery::before {
  content: '';
  position: absolute;
  right: -7rpx;
  top: 4rpx;
  width: 4rpx;
  height: 8rpx;
  border-radius: 0 3rpx 3rpx 0;
  background: #111827;
}

.battery::after {
  content: '';
  position: absolute;
  left: 3rpx;
  top: 3rpx;
  width: 22rpx;
  height: 6rpx;
  border-radius: 2rpx;
  background: #111827;
}

.nav-bar {
  height: 78rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  box-sizing: border-box;
}

.nav-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}

.nav-title {
  flex: 1;
  margin-left: 64rpx;
  color: #1f2937;
  font-size: 29rpx;
  font-weight: 500;
  text-align: center;
}

.capsule {
  width: 128rpx;
  height: 48rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #e5e7eb;
  border-radius: 26rpx;
  box-sizing: border-box;
}

.capsule-divider {
  width: 1rpx;
  height: 28rpx;
  background: #e5e7eb;
}

.mini-circle {
  width: 24rpx;
  height: 24rpx;
  border: 5rpx solid #111827;
  border-radius: 50%;
  box-sizing: border-box;
}

.tab-bar {
  height: 72rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1rpx solid #e5e7eb;
  box-sizing: border-box;
}

.tab-item {
  height: 72rpx;
  display: flex;
  align-items: center;
  position: relative;
  color: #6b7280;
  font-size: 24rpx;
  white-space: nowrap;
}

.tab-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rpx;
  border-radius: 4rpx;
  background: #3b82f6;
}

.content {
  height: calc(100vh - 192rpx);
  box-sizing: border-box;
}

.address-card,
.info-card,
.courier-card {
  margin: 18rpx 22rpx 0;
  border-radius: 10rpx;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
}

.address-card {
  padding: 26rpx 24rpx;
}

.address-line {
  height: 76rpx;
  display: flex;
  align-items: center;
}

.step {
  width: 58rpx;
  height: 76rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.step-dot {
  width: 54rpx;
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}

.sender {
  background: #10cfa4;
}

.receiver {
  background: #3d82ff;
}

.step-wire {
  position: absolute;
  left: 28rpx;
  top: 56rpx;
  width: 1rpx;
  height: 56rpx;
  border-left: 2rpx dashed #cbd5e1;
}

.address-copy {
  flex: 1;
  padding-left: 16rpx;
}

.address-title,
.address-desc {
  display: block;
}

.address-title {
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 34rpx;
}

.address-desc {
  margin-top: 7rpx;
  color: #a1a1aa;
  font-size: 21rpx;
  line-height: 28rpx;
}

.book-link {
  color: #1f2937;
  font-size: 25rpx;
  font-weight: 500;
}

.address-divider {
  height: 1rpx;
  margin: 20rpx 0 20rpx 74rpx;
  background: #edf0f5;
}

.cell {
  height: 78rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f2f5;
  box-sizing: border-box;
}

.head-cell {
  height: 84rpx;
}

.cell.last {
  border-bottom: none;
}

.cell-left,
.cell-right {
  display: flex;
  align-items: center;
}

.cell-title {
  color: #111827;
  font-size: 26rpx;
  font-weight: 600;
}

.required {
  height: 28rpx;
  margin-left: 10rpx;
  padding: 0 8rpx;
  border: 1rpx solid #ff5a36;
  border-radius: 16rpx;
  color: #ff5a36;
  font-size: 18rpx;
  line-height: 28rpx;
}

.cell-right {
  color: #9ca3af;
  font-size: 24rpx;
}

.stepper {
  height: 36rpx;
  display: flex;
  align-items: center;
  background: #f5f7fb;
}

.stepper-btn,
.stepper-value {
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 22rpx;
}

.stepper-btn {
  width: 40rpx;
  background: #f1f3f7;
}

.stepper-value {
  width: 70rpx;
  background: #f8fafc;
}

.courier-row {
  min-height: 122rpx;
  padding: 22rpx 24rpx 18rpx;
  display: flex;
  align-items: flex-start;
  border-bottom: 1rpx solid #f0f2f5;
  box-sizing: border-box;
}

.courier-row:last-child {
  border-bottom: none;
}

.logo {
  width: 52rpx;
  height: 52rpx;
  margin-top: 2rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 19rpx;
  font-weight: 800;
  line-height: 20rpx;
}

.courier-main {
  flex: 1;
  min-width: 0;
}

.courier-name-row {
  height: 30rpx;
  display: flex;
  align-items: center;
}

.courier-name {
  color: #111827;
  font-size: 27rpx;
  font-weight: 700;
}

.badge {
  height: 24rpx;
  margin-left: 10rpx;
  padding: 0 8rpx;
  border-radius: 12rpx;
  background: #4d94ff;
  color: #ffffff;
  font-size: 17rpx;
  line-height: 24rpx;
}

.price-row {
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  color: #8b95a1;
  font-size: 21rpx;
}

.price {
  color: #ff4d2d;
}

.tag {
  display: inline-flex;
  height: 27rpx;
  margin-top: 6rpx;
  padding: 0 10rpx;
  border-radius: 4rpx;
  background: #ff6a1c;
  color: #ffffff;
  font-size: 17rpx;
  line-height: 27rpx;
  max-width: 360rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.radio {
  width: 32rpx;
  height: 32rpx;
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #c6ccd5;
  border-radius: 50%;
  box-sizing: border-box;
}

.radio.checked {
  border-color: #4d94ff;
  background: #4d94ff;
}

.bottom-space {
  height: 188rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 22rpx calc(10rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-sizing: border-box;
  z-index: 9;
}

.notice {
  height: 38rpx;
  margin-top: 8rpx;
  border-radius: 4rpx;
  background: #ffe8df;
  color: #ff6638;
  font-size: 21rpx;
  line-height: 38rpx;
  text-align: center;
}

.submit-row {
  height: 82rpx;
  display: flex;
  align-items: center;
}

.fee {
  flex: 1;
}

.fee-line {
  display: flex;
  align-items: baseline;
  color: #111827;
  font-size: 25rpx;
  font-weight: 700;
}

.fee-price {
  color: #ff7a2b;
  font-size: 34rpx;
}

.agree {
  margin-top: 2rpx;
  display: flex;
  align-items: center;
  color: #a1a1aa;
  font-size: 18rpx;
}

.agree-dot {
  width: 20rpx;
  height: 20rpx;
  margin-right: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #4d94ff;
}

.protocol {
  color: #3b82f6;
}

.submit-button {
  width: 176rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background: #5c91ff;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 700;
}

.home-indicator {
  width: 236rpx;
  height: 8rpx;
  margin: 2rpx auto 0;
  border-radius: 8rpx;
  background: #111827;
}
</style>
