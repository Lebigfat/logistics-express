<template>
  <view class="express-page">
    <view class="top-area">
      <view class="search-row">
        <view class="search-box">
          <UvIcon name="search" color="#6f7378" size="25"></UvIcon>
          <input v-model="keyword" class="search-input" placeholder="请输入运单号查询/手机号" placeholder-class="search-placeholder" confirm-type="search" />
        </view>

        <view class="capsule">
          <UvIcon name="more-dot-fill" color="#000000" size="23"></UvIcon>
          <view class="capsule-line"></view>
          <view class="capsule-circle"></view>
        </view>
      </view>

      <scroll-view scroll-x class="status-tabs" show-scrollbar="false">
        <view v-for="item in tabs" :key="item.label" class="status-tab" :class="{ active: activeTab.value === item.value }" @tap="activeTab = item">
          <text>{{ item.label }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="content">
      <view v-if="orders.length" class="order-list">
        <view v-for="item in orders" :key="item.id" class="order-card">
          <view class="order-head">
            <text>{{ item.order_sn || `订单 ${item.id}` }}</text>
            <text class="order-status">{{ statusText(item.status) }}</text>
          </view>
          <view class="order-row">
            <text>重量 {{ item.weight || '-' }}kg</text>
            <text>件数 {{ item.number || '-' }}</text>
          </view>
          <view class="order-row">
            <text>实付 ¥{{ item.actual_payment_price || item.origin_price || '0.00' }}</text>
            <text>{{ item.createtime || '' }}</text>
          </view>
          <view class="order-actions">
            <view v-if="Number(item.status) === 1" class="outline-btn" @tap="cancelOrder(item)">取消订单</view>
            <view v-if="Number(item.status) === 1" class="primary-btn" @tap="payOrder(item)">去支付</view>
            <view v-if="Number(item.status) >= 2" class="primary-btn" @tap="queryLogistics(item)">查看物流</view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-title">您还没有进行寄件下单</text>
        <text class="empty-desc">可以先去寄件哦</text>
        <view class="send-btn" @tap="goSend">去寄件</view>
      </view>
    </view>

    <view class="follow-bar" v-if="showFollow">
      <view class="follow-close" @tap="showFollow = false">
        <UvIcon name="close" color="#ffffff" size="21"></UvIcon>
      </view>
      <text class="follow-text">关注公众号，领优惠券再加平台返利</text>
      <view class="follow-btn">去关注</view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { orderApi } from '@/services/api'

const tabs = [
  { label: '全部快递', value: '' },
  { label: '待付款', value: '1' },
  { label: '已付款', value: '2' },
  { label: '运输中', value: '4' },
  { label: '已取消', value: '5' },
]
const activeTab = ref(tabs[0])
const keyword = ref('')
const showFollow = ref(true)
const orders = ref([])

const goSend = () => {
  uni.navigateTo({ url: '/pages/send/index' })
}

const loadOrders = async () => {
  try {
    const data = await orderApi.list({ tabType: activeTab.value.value })
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    orders.value = rows
  } catch (error) {
    console.warn('load order list failed', error)
    orders.value = []
  }
}

const statusText = (status) => {
  const map = { 1: '待付款', 2: '已付款', 3: '到付单', 4: '运输中', 5: '已取消' }
  return map[Number(status)] || '全部'
}

const cancelOrder = async (item) => {
  try {
    await orderApi.cancel(item.id)
    uni.showToast({ title: '已取消', icon: 'none' })
    loadOrders()
  } catch (error) {
    uni.showToast({ title: error.message || '取消失败', icon: 'none' })
  }
}

const payOrder = async (item) => {
  try {
    const data = await orderApi.pay(item.id)
    const payParam = data?.payParam
    if (payParam) {
      uni.requestPayment({
        timeStamp: payParam.timeStamp,
        nonceStr: payParam.nonceStr,
        package: payParam.package,
        signType: payParam.signType,
        paySign: payParam.paySign,
        success: loadOrders,
      })
    } else {
      uni.showToast({ title: '支付参数缺失', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: error.message || '支付失败', icon: 'none' })
  }
}

const queryLogistics = async (item) => {
  try {
    const data = await orderApi.logistics(item.id)
    const route = data?.routeResps?.[0]?.routes?.[0]
    uni.showModal({
      title: data?.routeResps?.[0]?.mailNo || '物流信息',
      content: route ? `${route.acceptTime || ''}\n${route.remark || ''}` : '暂无物流轨迹',
      showCancel: false,
    })
  } catch (error) {
    uni.showToast({ title: error.message || '查询失败', icon: 'none' })
  }
}

watch(activeTab, loadOrders)
onMounted(loadOrders)
</script>

<style>
page {
  background: #f4f5f8;
}

.express-page {
  min-height: 100vh;
  position: relative;
  padding-bottom: calc(190rpx + env(safe-area-inset-bottom));
  background: #f4f5f8;
  color: #222222;
  box-sizing: border-box;
}

.top-area {
  padding-top: calc(var(--status-bar-height) + 22rpx);
  background: #ffffff;
}

.search-row {
  height: 76rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.search-box {
  flex: 1;
  height: 64rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  border-radius: 34rpx;
  background: #f3f3f3;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 64rpx;
  margin-left: 18rpx;
  color: #333333;
  font-size: 26rpx;
}

.search-placeholder {
  color: #c1c5ce;
  font-size: 26rpx;
}

.capsule {
  width: 174rpx;
  height: 64rpx;
  margin-left: 36rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #e3e3e3;
  border-radius: 34rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.capsule-line {
  width: 1rpx;
  height: 36rpx;
  background: #d7d7d7;
}

.capsule-circle {
  width: 42rpx;
  height: 42rpx;
  border: 8rpx solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
}

.status-tabs {
  width: 100%;
  height: 100rpx;
  white-space: nowrap;
}

.status-tab {
  height: 100rpx;
  padding: 0 30rpx;
  position: relative;
  display: inline-flex;
  align-items: center;
  color: #969898;
  font-size: 31rpx;
  font-weight: 700;
  box-sizing: border-box;
}

.status-tab.active {
  color: #4b88ff;
}

.status-tab.active::after {
  content: '';
  position: absolute;
  left: 42rpx;
  right: 42rpx;
  bottom: 0;
  height: 8rpx;
  background: #4b88ff;
}

.content {
  min-height: calc(100vh - 264rpx - 190rpx - env(safe-area-inset-bottom));
  padding: 24rpx 30rpx;
  box-sizing: border-box;
}

.empty-state {
  min-height: 620rpx;
  margin-top: -42rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.order-list {
  padding-bottom: 120rpx;
}

.order-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 14rpx;
  background: #ffffff;
}

.order-head,
.order-row,
.order-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-head {
  font-size: 28rpx;
  font-weight: 700;
}

.order-status {
  color: #438bff;
  font-size: 24rpx;
  font-weight: 500;
}

.order-row {
  margin-top: 16rpx;
  color: #8b95a1;
  font-size: 24rpx;
}

.order-actions {
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 22rpx;
}

.outline-btn,
.primary-btn {
  height: 52rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  font-size: 24rpx;
}

.outline-btn {
  border: 1rpx solid #cfd6e0;
  color: #6b7280;
}

.primary-btn {
  background: #438bff;
  color: #ffffff;
}

.empty-title {
  font-size: 31rpx;
  font-weight: 700;
}

.empty-desc {
  margin-top: 28rpx;
  color: #a3a5a8;
  font-size: 28rpx;
  font-weight: 700;
}

.send-btn {
  width: 220rpx;
  height: 72rpx;
  margin-top: 78rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 38rpx;
  background: linear-gradient(90deg, #71a8ff 0%, #438bff 100%);
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 700;
}

.follow-bar {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: calc(96rpx + env(safe-area-inset-bottom));
  height: 72rpx;
  padding: 0 18rpx 0 22rpx;
  display: flex;
  align-items: center;
  border-radius: 38rpx;
  background: rgba(55, 55, 55, 0.76);
  z-index: 8;
  box-sizing: border-box;
}

.follow-close {
  width: 38rpx;
  height: 38rpx;
  margin-right: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #ffffff;
  font-size: 27rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  width: 124rpx;
  height: 48rpx;
  margin-left: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 26rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
  font-weight: 700;
}
</style>
