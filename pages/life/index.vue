<template>
  <view class="page">
    <view class="hero">
      <text>生活服务</text>
      <text>当前 API 文档未提供旧衣回收、搬家、同城送货等接口</text>
    </view>
    <view class="panel">
      <view v-for="item in items" :key="item" class="item" @tap="showMissing(item)">
        <text>{{ item }}</text>
        <text>接口未提供</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const items = ['旧衣回收', '送货搬家', '同城送货', '分享赚佣']

const showMissing = (name) => {
  uni.showToast({ title: `${name}接口未提供`, icon: 'none' })
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

.hero {
  padding: calc(var(--status-bar-height) + 62rpx) 32rpx 54rpx;
  background: linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%);
}

.hero text:first-child {
  display: block;
  color: #111827;
  font-size: 40rpx;
  font-weight: 800;
}

.hero text:last-child {
  display: block;
  margin-top: 18rpx;
  color: #475569;
  font-size: 25rpx;
  line-height: 38rpx;
}

.panel {
  margin: 28rpx 30rpx;
  border-radius: 14rpx;
  background: #ffffff;
}

.item {
  min-height: 96rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
}

.item:last-child {
  border-bottom: none;
}

.item text:first-child {
  color: #111827;
  font-size: 29rpx;
  font-weight: 800;
}

.item text:last-child {
  color: #9ca3af;
  font-size: 24rpx;
}
</style>
