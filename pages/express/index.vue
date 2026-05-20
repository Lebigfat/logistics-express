<template>
  <view class="express-page">
    <view class="top-area">
      <view class="search-row">
        <view class="search-box">
          <UvIcon name="search" color="#6f7378" size="25"></UvIcon>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="请输入运单号/订单号/手机号"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="applySearch"
          />
        </view>
        <view class="search-btn" @tap="applySearch">搜索</view>
      </view>

      <scroll-view scroll-x class="status-tabs" show-scrollbar="false">
        <view
          v-for="item in tabs"
          :key="item.label"
          class="status-tab"
          :class="{ active: activeTab.value === item.value }"
          @tap="changeTab(item)"
        >
          <text>{{ item.label }}</text>
        </view>
      </scroll-view>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMore">
      <view v-if="filteredOrders.length" class="order-list">
        <view v-for="item in filteredOrders" :key="item.id" class="order-card" @tap="openDetail(item)">
          <view class="order-head">
            <text class="order-sn">{{ item.order_sn || `订单 ${item.id}` }}</text>
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
            <view v-if="Number(item.status) === 1" class="outline-btn" @tap.stop="cancelOrder(item)">取消订单</view>
            <view v-if="Number(item.status) === 1" class="primary-btn" @tap.stop="payOrder(item)">去支付</view>
            <view v-if="Number(item.status) >= 2" class="primary-btn" @tap.stop="queryLogistics(item)">查看物流</view>
          </view>
        </view>
        <view class="load-state">{{ loadingMore ? '加载中...' : finished ? '没有更多了' : '上拉加载更多' }}</view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-title">{{ loading ? '加载中...' : '暂无订单' }}</text>
        <text class="empty-desc">{{ keyword ? '当前搜索没有匹配订单' : '可以先去寄件下单' }}</text>
        <view class="send-btn" @tap="goSend">去寄件</view>
      </view>
    </scroll-view>

    <view v-if="detailVisible" class="popup-mask" @tap.self="detailVisible = false">
      <view class="detail-popup">
        <view class="popup-head">
          <text>订单详情</text>
          <view class="close-btn" @tap="detailVisible = false">×</view>
        </view>
        <view v-if="detailLoading" class="popup-loading">加载中...</view>
        <view v-else class="detail-body">
          <view class="detail-line"><text>订单号</text><text>{{ orderDetail.order_sn || '-' }}</text></view>
          <view class="detail-line"><text>运单号</text><text>{{ orderDetail.sf_order_sn || '-' }}</text></view>
          <view class="detail-line"><text>状态</text><text>{{ statusText(orderDetail.status) }}</text></view>
          <view class="detail-line"><text>重量/件数</text><text>{{ orderDetail.weight || '-' }}kg / {{ orderDetail.number || '-' }}件</text></view>
          <view class="detail-line"><text>预约时间</text><text>{{ orderDetail.sub_date || '-' }}</text></view>
          <view class="detail-line"><text>应付</text><text>¥{{ orderDetail.actual_payment_price || orderDetail.origin_price || '0.00' }}</text></view>
          <view class="detail-note">{{ orderDetail.note || '暂无备注' }}</view>
          <view class="detail-actions">
            <view v-if="Number(orderDetail.status) === 1" class="outline-btn" @tap="cancelOrder(orderDetail)">取消订单</view>
            <view v-if="Number(orderDetail.status) === 1" class="primary-btn" @tap="payOrder(orderDetail)">去支付</view>
            <view v-if="Number(orderDetail.status) >= 2" class="primary-btn" @tap="queryLogistics(orderDetail)">查看物流</view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="logisticsVisible" class="popup-mask" @tap.self="logisticsVisible = false">
      <view class="logistics-popup">
        <view class="popup-head">
          <text>{{ logisticsInfo.mailNo || '物流信息' }}</text>
          <view class="close-btn" @tap="logisticsVisible = false">×</view>
        </view>
        <view v-if="!logisticsRoutes.length" class="popup-loading">暂无物流轨迹</view>
        <view v-else class="route-list">
          <view v-for="(route, index) in logisticsRoutes" :key="`${route.acceptTime}-${index}`" class="route-item">
            <view class="route-dot" :class="{ active: index === 0 }"></view>
            <view class="route-copy">
              <text class="route-time">{{ route.acceptTime || '-' }}</text>
              <text class="route-text">{{ route.remark || '-' }}</text>
              <text v-if="route.acceptAddress" class="route-address">{{ route.acceptAddress }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { orderApi } from '@/services/api'

const tabs = [
  { label: '全部快递', value: '' },
  { label: '待付款', value: '1' },
  { label: '已付款', value: '2' },
  { label: '到付单', value: '3' },
  { label: '运输中', value: '4' },
  { label: '已取消', value: '5' },
]

const activeTab = ref(tabs[0])
const keyword = ref('')
const appliedKeyword = ref('')
const orders = ref([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref({})
const logisticsVisible = ref(false)
const logisticsInfo = ref({})
const logisticsRoutes = ref([])

const filteredOrders = computed(() => {
  const key = appliedKeyword.value.trim().toLowerCase()
  if (!key) return orders.value
  return orders.value.filter((item) =>
    [item.order_sn, item.sf_order_sn, item.mobile, item.tel, item.note]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(key)),
  )
})

const statusText = (status) => {
  const map = { 1: '待付款', 2: '已付款', 3: '到付单', 4: '运输中', 5: '已取消' }
  return map[Number(status)] || '全部'
}

const goSend = () => {
  uni.navigateTo({ url: '/pages/send/index' })
}

const changeTab = (item) => {
  activeTab.value = item
  reloadOrders()
}

const applySearch = () => {
  appliedKeyword.value = keyword.value
  if (!orders.value.length) reloadOrders()
}

const reloadOrders = () => {
  page.value = 1
  finished.value = false
  loadOrders(true)
}

const normalizeOrderRows = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

const loadOrders = async (reset = false) => {
  if ((loading.value || loadingMore.value) && !reset) return
  if (finished.value && !reset) return
  if (reset) loading.value = true
  else loadingMore.value = true

  try {
    const data = await orderApi.list({ page: page.value, pageSize, tabType: activeTab.value.value })
    const rows = normalizeOrderRows(data)
    orders.value = reset ? rows : orders.value.concat(rows)
    const lastPage = Number(data?.last_page || 0)
    finished.value = rows.length < pageSize || (lastPage ? page.value >= lastPage : false)
    if (!finished.value) page.value += 1
  } catch (error) {
    uni.showToast({ title: error.message || '订单加载失败', icon: 'none' })
    if (reset) orders.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  loadOrders(false)
}

const openDetail = async (item) => {
  detailVisible.value = true
  detailLoading.value = true
  orderDetail.value = item
  try {
    const data = await orderApi.detail(item.id)
    orderDetail.value = data || item
  } catch (error) {
    uni.showToast({ title: error.message || '详情加载失败', icon: 'none' })
  } finally {
    detailLoading.value = false
  }
}

const cancelOrder = async (item) => {
  uni.showModal({
    title: '取消订单',
    content: '确认取消该订单吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await orderApi.cancel(item.id)
        uni.showToast({ title: '已取消', icon: 'none' })
        detailVisible.value = false
        reloadOrders()
      } catch (error) {
        uni.showToast({ title: error.message || '取消失败', icon: 'none' })
      }
    },
  })
}

const payOrder = async (item) => {
  try {
    const data = await orderApi.pay(item.id)
    const payParam = data?.payParam
    if (!payParam) {
      uni.showToast({ title: '支付参数缺失', icon: 'none' })
      return
    }
    uni.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: reloadOrders,
    })
  } catch (error) {
    uni.showToast({ title: error.message || '支付失败', icon: 'none' })
  }
}

const queryLogistics = async (item) => {
  try {
    const data = await orderApi.logistics(item.id)
    const routeResp = data?.routeResps?.[0] || {}
    logisticsInfo.value = routeResp
    logisticsRoutes.value = Array.isArray(routeResp.routes) ? routeResp.routes : []
    logisticsVisible.value = true
  } catch (error) {
    uni.showToast({ title: error.message || '查询失败', icon: 'none' })
  }
}

onMounted(() => {
  loadOrders(true)
})
</script>

<style>
page {
  background: #f4f5f8;
}

.express-page {
  min-height: 100vh;
  position: relative;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
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

.search-btn {
  width: 104rpx;
  height: 58rpx;
  margin-left: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
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
  height: calc(100vh - 176rpx - var(--status-bar-height));
  padding: 24rpx 30rpx;
  box-sizing: border-box;
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
.order-actions,
.detail-line,
.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-head {
  font-size: 28rpx;
  font-weight: 700;
}

.order-sn {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-status {
  margin-left: 18rpx;
  color: #438bff;
  font-size: 24rpx;
  font-weight: 500;
}

.order-row {
  margin-top: 16rpx;
  color: #8b95a1;
  font-size: 24rpx;
}

.order-actions,
.detail-actions {
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

.load-state {
  padding: 24rpx 0;
  color: #9ca3af;
  font-size: 24rpx;
  text-align: center;
}

.empty-state {
  min-height: 620rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 99;
}

.detail-popup,
.logistics-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 82vh;
  padding: 28rpx 30rpx calc(30rpx + env(safe-area-inset-bottom));
  overflow: auto;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
}

.popup-head {
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 32rpx;
  font-weight: 700;
}

.close-btn {
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 46rpx;
  font-weight: 400;
}

.popup-loading {
  padding: 70rpx 0;
  color: #9ca3af;
  font-size: 26rpx;
  text-align: center;
}

.detail-body {
  padding-top: 20rpx;
}

.detail-line {
  min-height: 72rpx;
  border-bottom: 1rpx solid #edf0f5;
  color: #4b5563;
  font-size: 26rpx;
}

.detail-line text:first-child {
  color: #9ca3af;
}

.detail-note {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f5f7fb;
  color: #6b7280;
  font-size: 25rpx;
  line-height: 36rpx;
}

.route-list {
  margin-top: 24rpx;
}

.route-item {
  display: flex;
  position: relative;
  padding-bottom: 28rpx;
}

.route-item::after {
  content: '';
  position: absolute;
  left: 13rpx;
  top: 30rpx;
  bottom: 0;
  width: 2rpx;
  background: #e5e7eb;
}

.route-item:last-child::after {
  display: none;
}

.route-dot {
  width: 28rpx;
  height: 28rpx;
  margin-top: 4rpx;
  border-radius: 50%;
  background: #cfd6e0;
  z-index: 1;
}

.route-dot.active {
  background: #438bff;
}

.route-copy {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.route-time,
.route-text,
.route-address {
  display: block;
}

.route-time {
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.route-text {
  margin-top: 8rpx;
  color: #4b5563;
  font-size: 25rpx;
  line-height: 36rpx;
}

.route-address {
  margin-top: 6rpx;
  color: #9ca3af;
  font-size: 23rpx;
}
</style>
