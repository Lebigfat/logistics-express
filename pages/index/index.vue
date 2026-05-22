<template>
  <view class="page">
    <view class="hero">
      <view class="brand-row">
        <text class="brand">寄速通</text>
        <text class="brand-sub">快递寄件与订单管理</text>
      </view>
      <view class="search" @tap="go('/pages/express/index')">
        <text class="search-icon">⌕</text>
        <text class="search-text">输入订单号查看物流</text>
      </view>
      <view class="quick">
        <view class="quick-main" @tap="go('/pages/send/index')">
          <text class="quick-title">寄快递</text>
          <text class="quick-desc">选择寄收地址，试算运费并创建快递订单</text>
        </view>
        <view class="quick-side">
          <view class="quick-card" @tap="go('/pages/address/index')">
            <text>地址簿</text>
            <text>管理收寄地址</text>
          </view>
          <view class="quick-card" @tap="go('/pages/express/index')">
            <text>查快递</text>
            <text>订单与物流</text>
          </view>
        </view>
      </view>
    </view>

    <view class="panel tools">
      <view v-for="item in tools" :key="item.title" class="tool" @tap="go(item.url)">
        <view class="tool-icon">{{ item.icon }}</view>
        <text>{{ item.title }}</text>
      </view>
    </view>

    <view class="panel notice" @tap="openNotice">
      <text class="notice-label">公告</text>
      <text class="notice-copy">{{ notice.desc || plainNoticeContent || '暂无公告' }}</text>
    </view>

    <view class="banner">
      <text>小程序寄件闭环已接接口字段</text>
      <text>登录、地址、下单、支付、物流、统计均按 docs/api 文档实现</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { userApi } from '@/services/api'
import { debugLog } from '@/services/request'

const notice = ref({})
const plainNoticeContent = computed(() => String(notice.value?.content || '').replace(/<[^>]+>/g, ''))

const tools = [
  { title: '查运费', icon: '¥', url: '/pages/send/index' },
  { title: '地址管理', icon: '⌖', url: '/pages/address/index' },
  { title: '订单列表', icon: '☰', url: '/pages/express/index' },
  { title: '个人信息', icon: '○', url: '/pages/profile/index' },
]

const go = (url) => {
  if (['/pages/index/index', '/pages/express/index', '/pages/life/index', '/pages/profile/index'].includes(url)) {
    uni.switchTab({ url })
    return
  }
  uni.navigateTo({ url })
}

const openNotice = () => {
  if (!notice.value?.id) return
  uni.navigateTo({ url: `/pages/notice/index?id=${notice.value.id}` })
}

onMounted(async () => {
  try {
    debugLog('info', 'startup:index', {
      message: '开始请求首页公告',
      api: '/api/user/getNotice',
    })
    const data = await userApi.getNotice()
    notice.value = Array.isArray(data) ? data[0] || {} : data || {}
  } catch (error) {
    debugLog('warn', 'startup:index', {
      message: '首页 getNotice 请求失败',
      errorMessage: error?.message,
      statusCode: error?.statusCode,
      errMsg: error?.errMsg,
    })
    notice.value = {}
  }
})
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  color: #111827;
}

.hero {
  padding: calc(var(--status-bar-height) + 44rpx) 30rpx 42rpx;
  background: linear-gradient(135deg, #4d87ff 0%, #39d2b0 100%);
}

.brand-row {
  display: flex;
  flex-direction: column;
}

.brand {
  color: #ffffff;
  font-size: 46rpx;
  font-weight: 800;
}

.brand-sub {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 25rpx;
}

.search {
  height: 88rpx;
  margin-top: 36rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.search-icon {
  color: #438bff;
  font-size: 40rpx;
}

.search-text {
  margin-left: 20rpx;
  color: #9ca3af;
  font-size: 27rpx;
}

.quick {
  margin-top: 30rpx;
  display: flex;
  gap: 18rpx;
}

.quick-main,
.quick-card {
  border-radius: 14rpx;
  background: #ffffff;
}

.quick-main {
  flex: 1;
  min-height: 220rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.94);
  box-sizing: border-box;
}

.quick-title {
  display: block;
  color: #2563eb;
  font-size: 36rpx;
  font-weight: 800;
}

.quick-desc {
  display: block;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 34rpx;
}

.quick-side {
  width: 48%;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.quick-card {
  min-height: 100rpx;
  padding: 22rpx 24rpx;
  box-sizing: border-box;
}

.quick-card text:first-child {
  display: block;
  font-size: 29rpx;
  font-weight: 800;
}

.quick-card text:last-child {
  display: block;
  margin-top: 8rpx;
  color: #8b95a1;
  font-size: 23rpx;
}

.panel {
  margin: 24rpx 30rpx 0;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.tools {
  padding: 30rpx 12rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.tool {
  min-height: 118rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #303846;
  font-size: 24rpx;
}

.tool-icon {
  width: 58rpx;
  height: 58rpx;
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #eef5ff;
  color: #438bff;
  font-size: 32rpx;
  font-weight: 800;
}

.notice {
  min-height: 82rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
}

.notice-label {
  margin-right: 20rpx;
  color: #438bff;
  font-size: 25rpx;
  font-weight: 800;
}

.notice-copy {
  flex: 1;
  overflow: hidden;
  color: #4b5563;
  font-size: 25rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner {
  margin: 28rpx 30rpx 0;
  padding: 38rpx 30rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #d8f7eb 0%, #d9e9ff 100%);
}

.banner text {
  display: block;
  color: #0f172a;
  font-size: 31rpx;
  font-weight: 800;
}

.banner text:last-child {
  margin-top: 12rpx;
  color: #475569;
  font-size: 24rpx;
  font-weight: 500;
}
</style>
