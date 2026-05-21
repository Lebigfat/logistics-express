<template>
  <view class="page">
    <view class="top">
      <input v-model="keyword" class="search" placeholder="搜索 order_sn / sf_order_sn" confirm-type="search" />
      <button class="search-btn" @tap="reload">搜索</button>
    </view>
    <scroll-view scroll-x class="tabs" show-scrollbar="false">
      <view v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: tabType === tab.value }" @tap="changeTab(tab.value)">
        {{ tab.label }}
      </view>
    </scroll-view>

    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-if="loading && !orders.length" class="empty">加载中...</view>
      <view v-else-if="!filteredOrders.length" class="empty">
        <text>暂无订单</text>
        <button @tap="goSend">去寄件</button>
      </view>
      <view v-else v-for="item in filteredOrders" :key="item.id" class="card" @tap="openDetail(item)">
        <view class="head">
          <text>{{ item.order_sn || `订单 ${item.id}` }}</text>
          <text>{{ statusText(item.status) }}</text>
        </view>
        <view class="row"><text>sf_order_sn</text><text>{{ item.sf_order_sn || '-' }}</text></view>
        <view class="row"><text>weight / number</text><text>{{ item.weight || '-' }} / {{ item.number || '-' }}</text></view>
        <view class="row"><text>actual_payment_price</text><text>¥{{ moneyText(item.actual_payment_price || item.origin_price) }}</text></view>
        <view class="actions">
          <button v-if="Number(item.status) === 1" @tap.stop="pay(item)">支付</button>
          <button v-if="Number(item.status) === 1" @tap.stop="cancel(item)">取消</button>
          <button @tap.stop="queryLogistics(item)">物流</button>
        </view>
      </view>
      <view v-if="orders.length" class="load">{{ finished ? '没有更多了' : '上拉加载更多' }}</view>
    </scroll-view>

    <view v-if="detailVisible" class="mask" @tap.self="detailVisible = false">
      <view class="sheet">
        <view class="sheet-head"><text>订单详情</text><text @tap="detailVisible = false">×</text></view>
        <view v-for="key in detailKeys" :key="key" class="detail-row">
          <text>{{ key }}</text>
          <text>{{ detail[key] === undefined || detail[key] === null ? '-' : detail[key] }}</text>
        </view>
      </view>
    </view>

    <view v-if="logisticsVisible" class="mask" @tap.self="logisticsVisible = false">
      <view class="sheet">
        <view class="sheet-head"><text>{{ logistics.mailNo || '物流' }}</text><text @tap="logisticsVisible = false">×</text></view>
        <view v-if="!routes.length" class="empty small">暂无轨迹</view>
        <view v-else v-for="(route, index) in routes" :key="`${route.acceptTime}-${index}`" class="route">
          <text>{{ route.acceptTime || '-' }}</text>
          <text>{{ route.remark || '-' }}</text>
          <text>{{ route.acceptAddress || '' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { orderApi } from '@/services/api'
import { getRows, moneyText } from '@/utils/api-fields'

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: '1' },
  { label: '已付款', value: '2' },
  { label: '到付单', value: '3' },
  { label: '运输中', value: '4' },
  { label: '已取消', value: '5' },
]
const detailKeys = [
  'id',
  'order_sn',
  'sf_order_sn',
  'sender_id',
  'recipient_id',
  'delivery_type',
  'item_type',
  'fragile_type',
  'weight',
  'number',
  'is_bao_money',
  'bao_money',
  'pay_method',
  'sub_date',
  'note',
  'yg_price',
  'yh_price',
  'discount',
  'status',
  'origin_price',
  'actual_payment_price',
]

const keyword = ref('')
const tabType = ref('')
const page = ref(1)
const pageSize = 10
const orders = ref([])
const loading = ref(false)
const finished = ref(false)
const detailVisible = ref(false)
const detail = ref({})
const logisticsVisible = ref(false)
const logistics = ref({})
const routes = ref([])

const filteredOrders = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  if (!key) return orders.value
  return orders.value.filter((item) =>
    [item.order_sn, item.sf_order_sn].filter(Boolean).some((value) => String(value).toLowerCase().includes(key)),
  )
})

const statusText = (status) => ({ 1: '待付款', 2: '已付款', 3: '到付单', 4: '运输中', 5: '已取消' }[Number(status)] || '-')

const loadOrders = async (reset = false) => {
  if (loading.value || (finished.value && !reset)) return
  loading.value = true
  try {
    const data = await orderApi.list({ page: page.value, pageSize, tabType: tabType.value })
    const rows = getRows(data)
    orders.value = reset ? rows : orders.value.concat(rows)
    const lastPage = Number(data?.last_page || 0)
    finished.value = rows.length < pageSize || (lastPage ? page.value >= lastPage : false)
    if (!finished.value) page.value += 1
  } catch (error) {
    uni.showToast({ title: error.message || '订单加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const reload = () => {
  page.value = 1
  finished.value = false
  loadOrders(true)
}

const loadMore = () => loadOrders(false)
const changeTab = (value) => {
  tabType.value = value
  reload()
}
const goSend = () => uni.navigateTo({ url: '/pages/send/index' })

const openDetail = async (item) => {
  detailVisible.value = true
  detail.value = item
  try {
    detail.value = (await orderApi.detail(item.id)) || item
  } catch (error) {
    uni.showToast({ title: error.message || '详情加载失败', icon: 'none' })
  }
}

const pay = async (item) => {
  try {
    const data = await orderApi.pay(item.id)
    const payParam = data?.payParam
    if (!payParam) return
    uni.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: reload,
    })
  } catch (error) {
    uni.showToast({ title: error.message || '支付失败', icon: 'none' })
  }
}

const cancel = (item) => {
  uni.showModal({
    title: '取消订单',
    content: '确认取消该订单吗？',
    success: async (res) => {
      if (!res.confirm) return
      await orderApi.cancel(item.id)
      reload()
    },
  })
}

const queryLogistics = async (item) => {
  try {
    const data = await orderApi.logistics(item.id)
    const first = data?.routeResps?.[0] || {}
    logistics.value = first
    routes.value = Array.isArray(first.routes) ? first.routes : []
    logisticsVisible.value = true
  } catch (error) {
    uni.showToast({ title: error.message || '物流查询失败', icon: 'none' })
  }
}

onMounted(() => loadOrders(true))
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.top {
  padding: calc(var(--status-bar-height) + 20rpx) 28rpx 18rpx;
  display: flex;
  gap: 16rpx;
  background: #ffffff;
}

.search {
  flex: 1;
  height: 68rpx;
  padding: 0 24rpx;
  border-radius: 34rpx;
  background: #f3f5f8;
  font-size: 25rpx;
  box-sizing: border-box;
}

.search-btn {
  width: 116rpx;
  height: 68rpx;
  border-radius: 34rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 68rpx;
}

.tabs {
  height: 88rpx;
  white-space: nowrap;
  background: #ffffff;
}

.tab {
  height: 88rpx;
  padding: 0 30rpx;
  display: inline-flex;
  align-items: center;
  color: #8b95a1;
  font-size: 27rpx;
  font-weight: 700;
}

.tab.active {
  color: #438bff;
}

.list {
  height: calc(100vh - 176rpx - var(--status-bar-height));
  padding: 24rpx 28rpx;
  box-sizing: border-box;
}

.card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 14rpx;
  background: #ffffff;
}

.head,
.row,
.actions,
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head {
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
}

.head text:first-child {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head text:last-child {
  margin-left: 18rpx;
  color: #438bff;
  font-size: 24rpx;
}

.row {
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.actions {
  justify-content: flex-end;
  gap: 14rpx;
  margin-top: 22rpx;
}

.actions button {
  min-width: 100rpx;
  height: 54rpx;
  border-radius: 28rpx;
  background: #eef5ff;
  color: #438bff;
  font-size: 24rpx;
  line-height: 54rpx;
}

.empty,
.load {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8b95a1;
  font-size: 27rpx;
}

.empty button {
  width: 180rpx;
  height: 66rpx;
  margin-top: 28rpx;
  border-radius: 34rpx;
  background: #438bff;
  color: #ffffff;
  line-height: 66rpx;
}

.small {
  padding: 50rpx 0;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 99;
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 80vh;
  padding: 28rpx 30rpx calc(30rpx + env(safe-area-inset-bottom));
  overflow: auto;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
}

.sheet-head {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 32rpx;
  font-weight: 800;
}

.sheet-head text:last-child {
  width: 60rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 48rpx;
  font-weight: 400;
}

.detail-row {
  min-height: 68rpx;
  border-bottom: 1rpx solid #edf0f5;
  color: #4b5563;
  font-size: 24rpx;
}

.detail-row text:first-child {
  width: 220rpx;
  color: #8b95a1;
}

.detail-row text:last-child {
  flex: 1;
  text-align: right;
  word-break: break-all;
}

.route {
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf0f5;
}

.route text {
  display: block;
  color: #4b5563;
  font-size: 25rpx;
  line-height: 36rpx;
}

.route text:first-child {
  color: #111827;
  font-weight: 800;
}
</style>
