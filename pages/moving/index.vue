<template>
  <view class="moving-page">
    <AppHead title="送货搬家" show-back></AppHead>
    <scroll-view scroll-y class="content">
      <view class="truck-card">
        <view class="truck-tabs">
          <view v-for="item in trucks" :key="item.name" class="truck-tab" :class="{ active: selectedTruck.name === item.name }" @tap="selectedTruck = item">
            <text>{{ item.name }}</text>
            <text>{{ item.size }}</text>
          </view>
        </view>
        <view class="truck-visual">🚚</view>
        <text class="truck-desc">载方{{ selectedTruck.capacity }} | 载重{{ selectedTruck.load }}</text>
      </view>

      <view class="address-card">
        <view class="address-line">
          <view class="step-dot sender">装</view>
          <view class="address-copy">
            <text>何其为 17712345678</text>
            <text>北京市北京市昌平区沙河镇站前路木器厂宿舍</text>
          </view>
          <text class="book-link">地址簿</text>
        </view>
        <view class="address-divider"></view>
        <view class="address-line">
          <view class="step-dot receiver">卸</view>
          <view class="address-copy">
            <text>何为 15812347856</text>
            <text>四川省成都市双流区新通大道龙腾苑宿舍</text>
          </view>
          <text class="book-link">地址簿</text>
        </view>
      </view>

      <view class="info-card">
        <view class="cell" @tap="followCar = !followCar">
          <text>跟车</text>
          <view class="cell-right">
            <text>{{ followCar ? '1人' : '无' }}</text>
            <UvIcon name="arrow-right" color="#333333" size="18"></UvIcon>
          </view>
        </view>
        <view class="cell">
          <text>订单联系电话</text>
          <view class="cell-right"><text>17743258541</text><UvIcon name="arrow-right" color="#333333" size="18"></UvIcon></view>
        </view>
        <view class="cell">
          <text>优惠券</text>
          <view class="cell-right"><text>暂无可用优惠券</text><UvIcon name="arrow-right" color="#333333" size="18"></UvIcon></view>
        </view>
        <view class="cell last">
          <text>备注</text>
          <view class="cell-right"><text>选填</text><UvIcon name="arrow-right" color="#333333" size="18"></UvIcon></view>
        </view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="notice">注:所有费用都在平台完成，无需额外付费</view>
      <view class="submit-row">
        <view>
          <view class="fee-line">运费：<text>￥3980</text></view>
          <view class="agree">✓ 我已阅读并同意《寄件服务协议》</view>
        </view>
        <view class="submit-btn">立即下单</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const trucks = [
  { name: '微面', size: '4米2', capacity: '1.2~1.8立方', load: '0.2~0.3吨' },
  { name: '小面', size: '5米2', capacity: '1.5~2.2立方', load: '0.2~0.4吨' },
  { name: '中面', size: '6米8', capacity: '1.7~2.4立方', load: '0.3~0.5吨' },
  { name: '依维柯', size: '7米6', capacity: '2.4~3.5立方', load: '0.5~0.8吨' },
  { name: '小货', size: '9米6', capacity: '4~6立方', load: '1~1.5吨' },
  { name: '中货', size: '13米', capacity: '8~12立方', load: '2~3吨' },
]
const selectedTruck = ref(trucks[2])
const followCar = ref(false)
</script>

<style>
page {
  background: #f2f3f6;
}

.moving-page {
  min-height: 100vh;
  background: #f2f3f6;
}

.content {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 24rpx 24rpx 170rpx;
  box-sizing: border-box;
}

.truck-card,
.address-card,
.info-card {
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.truck-card {
  padding: 46rpx 28rpx 36rpx;
  text-align: center;
}

.truck-tabs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8rpx;
}

.truck-tab {
  height: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.truck-tab.active {
  background: #5c91ff;
  color: #ffffff;
}

.truck-visual {
  margin-top: 86rpx;
  font-size: 150rpx;
}

.truck-desc {
  display: block;
  margin-top: 30rpx;
  color: #666666;
  font-size: 26rpx;
}

.address-card,
.info-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
}

.address-line {
  display: flex;
  align-items: center;
}

.step-dot {
  width: 72rpx;
  height: 72rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.sender {
  background: #11c9a6;
}

.receiver {
  background: #4b8dff;
}

.address-copy {
  flex: 1;
  min-width: 0;
}

.address-copy text {
  display: block;
  overflow: hidden;
  font-size: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-copy text + text {
  margin-top: 8rpx;
  color: #999999;
  font-size: 26rpx;
  white-space: normal;
}

.book-link {
  width: 116rpx;
  border-left: 1rpx solid #e5e7eb;
  font-size: 31rpx;
  text-align: right;
}

.address-divider {
  height: 1rpx;
  margin: 26rpx 0 26rpx 90rpx;
  background: #edf0f5;
}

.cell {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
  font-size: 31rpx;
}

.cell.last {
  border-bottom: none;
}

.cell-right {
  display: flex;
  align-items: center;
  color: #999999;
}

.bottom-space {
  height: 30rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 30rpx calc(10rpx + env(safe-area-inset-bottom));
  background: #ffffff;
}

.notice {
  height: 48rpx;
  margin-top: 8rpx;
  border-radius: 7rpx;
  background: #ffe9e1;
  color: #ff4d1f;
  font-size: 27rpx;
  line-height: 48rpx;
  text-align: center;
}

.submit-row {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fee-line {
  font-size: 31rpx;
}

.fee-line text {
  color: #ff6a00;
  font-size: 36rpx;
}

.agree {
  margin-top: 4rpx;
  color: #9a9a9a;
  font-size: 23rpx;
}

.submit-btn {
  width: 220rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #4b8dff;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}
</style>
