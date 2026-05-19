<template>
  <view class="coupon-page">
    <AppHead title="优惠券" show-back></AppHead>

    <view class="coupon-tabs">
      <view v-for="tab in couponTabs" :key="tab.key" class="coupon-tab" :class="{ active: couponTab === tab.key }" @tap="couponTab = tab.key">
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="coupon-scroll">
      <view v-for="coupon in currentCoupons" :key="coupon.id" class="coupon-card" :class="{ disabled: coupon.disabled }">
        <view class="coupon-main">
          <view class="coupon-amount">
            <text class="coupon-currency">¥</text>
            <text class="coupon-number">{{ coupon.amount }}</text>
          </view>
          <view class="coupon-info">
            <text class="coupon-name">{{ coupon.title }}</text>
            <text class="coupon-condition">{{ coupon.condition }}</text>
            <text class="coupon-expire">有效期至: {{ coupon.expire }}</text>
            <view class="coupon-detail-toggle" @tap="toggleDetail(coupon.id)">
              <text>详细说明</text>
              <UvIcon :name="openDetailId === coupon.id ? 'arrow-up' : 'arrow-down'" color="#9ca3af" size="13"></UvIcon>
            </view>
          </view>
          <view class="coupon-use-btn" :class="{ disabled: coupon.disabled, selected: selectedCoupon?.id === coupon.id }" @tap.stop="useCoupon(coupon)">
            <text>{{ coupon.disabled ? '失效' : selectedCoupon?.id === coupon.id ? '已选择' : '立即使用' }}</text>
          </view>
        </view>
        <view v-if="openDetailId === coupon.id" class="coupon-detail">
          <text v-for="line in coupon.details" :key="line">·{{ line }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="coupon-bottom-bar">
      <view class="coupon-confirm-btn" @tap="confirmCoupon">确定</view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const couponTabs = [
  { key: 'available', label: '可使用' },
  { key: 'expired', label: '已失效' },
]
const couponTab = ref('available')
const openDetailId = ref(1)
const selectedCoupon = ref(null)
let eventChannel = null

const coupons = [
  {
    id: 1,
    amount: '0.2',
    title: '福利券',
    condition: '满0.2使用',
    expire: '2026.10.31 23:59',
    disabled: false,
    details: ['该券可在平台寄件下单时抵扣运费', '特定活动商品、超重补缴订单不可用'],
  },
  {
    id: 2,
    amount: '1',
    title: '新客寄件券',
    condition: '满5使用',
    expire: '2026.12.31 23:59',
    disabled: false,
    details: ['仅限首单使用', '不可与其他优惠叠加'],
  },
  {
    id: 3,
    amount: '0.2',
    title: '福利券',
    condition: '满0.2使用',
    expire: '2022.10.31 23:59',
    disabled: true,
    details: ['该券已超过有效期', '失效券不可恢复使用'],
  },
]

const currentCoupons = computed(() => coupons.filter((item) => (couponTab.value === 'available' ? !item.disabled : item.disabled)))

const toggleDetail = (id) => {
  openDetailId.value = openDetailId.value === id ? null : id
}

const useCoupon = (coupon) => {
  if (coupon.disabled) return
  selectedCoupon.value = coupon
}

const confirmCoupon = () => {
  if (eventChannel && selectedCoupon.value) eventChannel.emit('selectCoupon', selectedCoupon.value)
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  eventChannel = pages[pages.length - 1]?.getOpenerEventChannel?.()
})
</script>

<style>
page {
  background: #f3f4f6;
}

.coupon-page {
  min-height: 100vh;
  background: #f3f4f6;
}

.coupon-tabs {
  height: 88rpx;
  display: flex;
  background: #ffffff;
}

.coupon-tab {
  flex: 1;
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 28rpx;
  font-weight: 600;
}

.coupon-tab.active {
  color: #2f7df6;
}

.coupon-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 64rpx;
  height: 5rpx;
  border-radius: 5rpx;
  background: #2f7df6;
  transform: translateX(-50%);
}

.coupon-scroll {
  height: calc(100vh - 176rpx - var(--status-bar-height));
  padding: 18rpx 20rpx 150rpx;
  box-sizing: border-box;
}

.coupon-card {
  margin-bottom: 18rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #ffffff;
}

.coupon-main {
  min-height: 178rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f1f3f7;
}

.coupon-amount {
  width: 190rpx;
  display: flex;
  align-items: baseline;
  justify-content: center;
  color: #ef4444;
  font-weight: 700;
}

.coupon-currency {
  font-size: 30rpx;
}

.coupon-number {
  font-size: 58rpx;
}

.coupon-info {
  flex: 1;
  min-width: 0;
  padding: 24rpx 0 18rpx;
}

.coupon-name,
.coupon-condition,
.coupon-expire {
  display: block;
}

.coupon-name {
  font-size: 30rpx;
  font-weight: 700;
}

.coupon-condition {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.coupon-expire {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 22rpx;
}

.coupon-detail-toggle {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  color: #9ca3af;
  font-size: 22rpx;
}

.coupon-detail-toggle text {
  margin-right: 6rpx;
}

.coupon-use-btn {
  width: 136rpx;
  height: 54rpx;
  margin: 0 20rpx 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  background: #2f7df6;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}

.coupon-use-btn.selected {
  background: #10b981;
}

.coupon-card.disabled .coupon-amount,
.coupon-card.disabled .coupon-name,
.coupon-card.disabled .coupon-condition,
.coupon-card.disabled .coupon-expire,
.coupon-card.disabled .coupon-detail-toggle {
  color: #b8bec7;
}

.coupon-use-btn.disabled {
  background: #c7cbd1;
}

.coupon-detail {
  padding: 16rpx 28rpx 22rpx 190rpx;
  color: #9ca3af;
  font-size: 22rpx;
  line-height: 34rpx;
  box-sizing: border-box;
}

.coupon-detail text {
  display: block;
}

.coupon-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  z-index: 9;
  box-sizing: border-box;
}

.coupon-confirm-btn {
  height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: #4d8df7;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
