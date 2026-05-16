<template>
  <view class="send-page">
    <AppHead :title="pageTitle">
      <template #left>
        <view class="head-back" @tap="handleHeaderBack">
          <UvIcon name="arrow-left" color="#1f2937" size="21"></UvIcon>
        </view>
      </template>
    </AppHead>

    <template v-if="pageMode === 'main'">
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
      <template v-if="activeTab === '寄快递'">
        <view class="address-card">
          <view class="address-line">
            <view class="step">
              <view class="step-dot sender">寄</view>
              <view class="step-wire"></view>
            </view>
            <view class="address-copy">
              <text class="address-title">{{ senderAddress ? `${senderAddress.name} ${senderAddress.phone}` : '寄件人信息' }}</text>
              <text class="address-desc">{{ senderAddress ? `${senderAddress.region}${senderAddress.detail}` : '请输入真实姓名' }}</text>
            </view>
            <text class="book-link" @tap="openAddressBook('sender')">地址簿</text>
          </view>
          <view class="address-divider"></view>
          <view class="address-line">
            <view class="step">
              <view class="step-dot receiver">收</view>
            </view>
            <view class="address-copy">
              <text class="address-title">{{ receiverAddress ? `${receiverAddress.name} ${receiverAddress.phone}` : '收件人信息' }}</text>
              <text class="address-desc">{{ receiverAddress ? `${receiverAddress.region}${receiverAddress.detail}` : '支持地址粘贴、图片识别' }}</text>
            </view>
            <text class="book-link" @tap="openAddressBook('receiver')">地址簿</text>
          </view>
        </view>

        <view class="info-card">
          <view class="cell head-cell" @tap="pageMode = 'goodsForm'">
            <view class="cell-left">
              <text class="cell-title">物品信息</text>
              <text class="required" v-if="!goodsSaved">必填</text>
              <text class="goods-summary" v-else>{{ goodsSummary }}</text>
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
          <view class="cell" @tap="openCouponPage">
            <text class="cell-title">优惠券</text>
            <view class="cell-right">
              <text>{{ selectedCouponText }}</text>
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
      </template>

      <template v-else-if="activeTab === '批量寄件'">
        <view class="batch-address-card">
          <view class="batch-address-row">
            <view class="step-dot sender">寄</view>
            <text class="batch-main-text">新建寄件人</text>
            <text class="book-link" @tap="openAddressBook('sender')">地址簿</text>
          </view>
        </view>

        <view class="batch-info-card">
          <text class="batch-section-title">收件人信息</text>
          <view class="batch-tool-row">
            <view class="batch-tool" v-for="item in batchTools" :key="item.text">
              <UvIcon :name="item.icon" color="#6b7280" size="17"></UvIcon>
              <text>{{ item.text }}</text>
            </view>
          </view>
        </view>

        <view class="batch-courier-card" @tap="showCourierPopup = true">
          <text class="cell-title">快递公司</text>
          <view class="cell-right">
            <text>{{ selectedBatchCourier ? selectedBatchCourier.name : '请选择' }}</text>
            <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
          </view>
        </view>
      </template>

      <view v-else class="empty-panel">
        <text>{{ activeTab }}</text>
        <text class="empty-desc">功能开发中</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="notice">注:所有费用都在平台完成，无需向快递员额外付费</view>
      <view class="submit-row">
        <view class="fee">
          <view class="fee-line">
            <text>运费：</text>
            <text class="fee-price">￥{{ activeTab === '批量寄件' ? 0 : 3980 }}</text>
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
    </template>

    <template v-else-if="pageMode === 'goodsForm'">
      <scroll-view scroll-y class="goods-form-scroll">
        <view class="goods-section">
          <text class="goods-label">物品类型</text>
          <view class="goods-type-grid">
            <view
              v-for="item in goodsTypes"
              :key="item"
              class="goods-type"
              :class="{ active: goodsForm.type === item }"
              @tap="goodsForm.type = item"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view class="goods-card">
          <view class="goods-row goods-price-row">
            <view class="goods-price-left">
              <view class="goods-row-title">
                <text>报价金额（元）</text>
                <text class="help-icon">?</text>
              </view>
              <text class="goods-tip">保价丢件可赔付</text>
            </view>
            <input
              v-model="goodsForm.insuredAmount"
              class="goods-input"
              type="number"
              placeholder="请输入金额"
              placeholder-class="form-placeholder"
            />
          </view>
          <view class="goods-row">
            <text class="goods-row-title">快递重量（kg）</text>
            <view class="stepper">
              <text class="stepper-btn" @tap="changeGoodsNumber('weight', -1)">-</text>
              <text class="stepper-value">{{ goodsForm.weight }}</text>
              <text class="stepper-btn" @tap="changeGoodsNumber('weight', 1)">+</text>
            </view>
          </view>
          <view class="goods-row">
            <text class="goods-row-title">体积重量</text>
            <view class="volume-inputs">
              <input v-model="goodsForm.length" type="number" placeholder="长(cm)" placeholder-class="form-placeholder" />
              <input v-model="goodsForm.width" type="number" placeholder="宽(cm)" placeholder-class="form-placeholder" />
              <input v-model="goodsForm.height" type="number" placeholder="高(cm)" placeholder-class="form-placeholder" />
            </view>
          </view>
          <view class="goods-row">
            <text class="goods-row-title">件数</text>
            <view class="stepper">
              <text class="stepper-btn" @tap="changeGoodsNumber('count', -1)">-</text>
              <text class="stepper-value">{{ goodsForm.count }}</text>
              <text class="stepper-btn" @tap="changeGoodsNumber('count', 1)">+</text>
            </view>
          </view>
        </view>

        <view class="goods-note">
          <text class="goods-note-title">重要提示：</text>
          <text>1、根据快递行业惯例，若包裹体积重量(kg)大于称重重量，将按体积重量计算运费。</text>
          <text style="color:#498DFF">2、请如实填写重量，快递员上门后计算重量大于下单重量的，可回到平台补缴运费。</text>
          <text>3、计费重量不足1kg的包裹，按1kg计算；超过1KG不足2KG的部分，按2KG计算。</text>
          <text>4、托寄物品应遵守国家相关规定。</text>
        </view>
      </scroll-view>

      <view class="save-address-bar">
        <view class="save-address-btn" @tap="saveGoodsInfo">保存</view>
      </view>
    </template>

    <u-popup
      v-model:show="showCourierPopup"
      mode="bottom"
      round="24rpx"
      :safe-area-inset-bottom="true"
      :close-on-click-overlay="true"
      bg-color="#ffffff"
    >
      <view class="courier-popup">
        <view class="popup-handle"></view>
        <view class="popup-head">
          <view class="popup-side"></view>
          <text class="popup-title">选择快递公司</text>
          <view class="popup-close" @tap="showCourierPopup = false">
            <UvIcon name="close" color="#9ca3af" size="20"></UvIcon>
          </view>
        </view>

        <view
          v-for="item in batchCouriers"
          :key="item.name"
          class="popup-courier-row"
          @tap="pendingBatchCourier = item"
        >
          <view class="popup-logo" :style="{ backgroundColor: item.color, color: item.textColor || '#ffffff' }">
            <text>{{ item.logo }}</text>
          </view>
          <view class="popup-courier-main">
            <view class="popup-name-row">
              <text class="popup-courier-name">{{ item.name }}</text>
              <text v-if="item.recommend" class="recommend-tag">推荐</text>
            </view>
            <view class="popup-price-line">
              <text>预估价格：</text>
              <text class="popup-price">{{ item.price }}元起</text>
            </view>
            <text class="popup-tag">{{ item.tag }}</text>
          </view>
          <view class="popup-radio" :class="{ checked: pendingBatchCourier.name === item.name }">
            <UvIcon v-if="pendingBatchCourier.name === item.name" name="checkmark" color="#ffffff" size="13" bold></UvIcon>
          </view>
        </view>

        <view class="popup-confirm" @tap="confirmBatchCourier">确定</view>
      </view>
    </u-popup>

  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppHead from '../../components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const tabs = ['寄快递', '批量寄件', '寄大件', '寄得物仓', '商家寄件']
const pageMode = ref('main')
const activeTab = ref('寄快递')
const selectedCourier = ref('圆通')
const showCourierPopup = ref(false)
const senderAddress = ref(null)
const receiverAddress = ref(null)
const goodsSaved = ref(false)
const goodsTypes = ['食品饮品', '潮玩', '美妆', '数码电器', '家居', '零食', '酒水', '文件', '日用品', '图书', '箱包', '其他']
const goodsForm = ref({
  type: '食品饮品',
  insuredAmount: '',
  weight: 2,
  length: '',
  width: '',
  height: '',
  count: 1,
})
const selectedCoupon = ref(null)

const batchTools = [
  { text: '地址簿选择', icon: 'file-text' },
  { text: 'Excel导入', icon: 'edit-pen' },
  { text: '批量识别', icon: 'scan' },
]

const batchCouriers = [
  { name: '圆通', logo: 'YTO', color: '#5d2d82', recommend: true, price: 5, tag: '极力推荐，取件较好，上门及时' },
  { name: '韵达', logo: 'Y', color: '#ffcf23', textColor: '#111827', price: 5, tag: '官方渠道，取件较好，效率高' },
  { name: '中通快递', logo: 'ZTO', color: '#2fa7ff', price: 5, tag: '全国经营，价格优惠' },
  { name: '申通快递', logo: 'sto', color: '#737373', price: 5, tag: '平台补贴体验' },
  { name: '菜鸟快递', logo: '菜', color: '#0398ff', price: 8, tag: '菜鸟直营，2小时内上门' },
]

const selectedBatchCourier = ref(null)
const pendingBatchCourier = ref(batchCouriers[0])

const goodsSummary = computed(() => `${goodsForm.value.type}，${goodsForm.value.weight}kg，${goodsForm.value.count}件`)
const pageTitle = computed(() => (pageMode.value === 'goodsForm' ? '物品信息' : '寄快递'))
const selectedCouponText = computed(() => (selectedCoupon.value ? `${selectedCoupon.value.title} -￥${selectedCoupon.value.amount}` : '未使用'))

const couriers = [
  { name: '圆通', logo: 'YT', color: '#5d2d82', badge: '推荐', price: 5, tag: '极力推荐，取件较好，上门及时' },
  { name: '韵达', logo: 'Y', color: '#ffcf23', textColor: '#111827', price: 5, tag: '官方渠道，取件较好，效率高' },
  { name: '中通快递', logo: 'ZTO', color: '#2fa7ff', price: 5, tag: '全国经营，价格优惠' },
  { name: '申通快递', logo: 'sto', color: '#737373', price: 5, tag: '平台补贴体验' },
  { name: '菜鸟快递', logo: '菜', color: '#0398ff', price: 8, tag: '菜鸟直营，2小时内上门' },
  { name: '极兔快递', logo: 'J&T', color: '#ef2b2d', price: 5, tag: '适合分区内，超强外派的单品' },
  { name: '京东快递', logo: 'JD', color: '#eb3b32', price: 7, tag: '京东自营，当天揽收' },
]

const confirmBatchCourier = () => {
  selectedBatchCourier.value = pendingBatchCourier.value
  showCourierPopup.value = false
}

const openCouponPage = () => {
  uni.navigateTo({
    url: '/pages/coupon/index',
    events: {
      selectCoupon(coupon) {
        selectedCoupon.value = coupon
      },
    },
  })
}

const openAddressBook = (type) => {
  uni.navigateTo({
    url: `/pages/address/index?type=${type}`,
    events: {
      selectAddress(payload) {
        if (payload.type === 'receiver') {
          receiverAddress.value = payload.address
        } else {
          senderAddress.value = payload.address
        }
      },
    },
  })
}

const handleHeaderBack = () => {
  if (pageMode.value === 'goodsForm') {
    pageMode.value = 'main'
    return
  }

  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({
    url: '/pages/index/index',
  })
}

const changeGoodsNumber = (field, delta) => {
  const min = field === 'count' ? 1 : 1
  goodsForm.value[field] = Math.max(min, Number(goodsForm.value[field] || min) + delta)
}

const saveGoodsInfo = () => {
  goodsSaved.value = true
  pageMode.value = 'main'
  activeTab.value = '寄快递'
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

.head-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
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

.save-address-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 38rpx calc(30rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  background: #ffffff;
  box-sizing: border-box;
  z-index: 9;
}

.save-address-btn {
  height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 27rpx;
}

.save-address-btn {
  flex: 1;
  background: #4d8df7;
  color: #ffffff;
}

.form-placeholder {
  color: #a1a1aa;
  font-size: 26rpx;
}

.save-address-btn {
  width: 100%;
  flex: 1;
}

.goods-form-scroll {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 18rpx 22rpx 150rpx;
  box-sizing: border-box;
}

.goods-section {
  padding: 0 0 18rpx;
}

.goods-label {
  display: block;
  margin-bottom: 18rpx;
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.goods-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.goods-type {
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e5e7eb;
  border-radius: 8rpx;
  background: #ffffff;
  color: #9ca3af;
  font-size: 22rpx;
  box-sizing: border-box;
}

.goods-type.active {
  border-color: #4d8df7;
  background: #4d8df7;
  color: #ffffff;
}

.goods-card,
.goods-note {
  margin-top: 18rpx;
  border-radius: 10rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.goods-card {
  padding: 0 22rpx;
}

.goods-row {
  min-height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
}

.goods-row:last-child {
  border-bottom: none;
}

.goods-price-row {
  min-height: 92rpx;
}

.goods-price-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-row-title {
  display: flex;
  align-items: center;
  color: #111827;
  font-size: 25rpx;
  font-weight: 700;
}

.help-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #cfd6e0;
  border-radius: 50%;
  color: #9ca3af;
  font-size: 17rpx;
  font-weight: 400;
}

.goods-input {
  width: 150rpx;
  height: 48rpx;
  padding: 0 12rpx;
  background: #f5f7fb;
  color: #4b5563;
  font-size: 22rpx;
  text-align: right;
  box-sizing: border-box;
}

.goods-tip {
  display: block;
  margin-top: 6rpx;
  color: #ff5a36;
  font-size: 18rpx;
  line-height: 24rpx;
}

.volume-inputs {
  display: flex;
  align-items: center;
}

.volume-inputs input {
  width: 88rpx;
  height: 42rpx;
  margin-left: 8rpx;
  background: #f5f7fb;
  color: #4b5563;
  font-size: 20rpx;
  text-align: center;
}

.goods-note {
  padding: 26rpx 22rpx;
}

.goods-note text {
  display: block;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 34rpx;
}

.goods-note .goods-note-title {
  margin-bottom: 8rpx;
  color: #4b5563;
  font-weight: 700;
}

.address-card,
.info-card,
.courier-card,
.batch-address-card,
.batch-info-card,
.batch-courier-card,
.empty-panel {
  margin: 18rpx 22rpx 0;
  border-radius: 10rpx;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
}

.address-card {
  padding: 26rpx 24rpx;
}

.batch-address-card {
  padding: 24rpx;
}

.batch-address-row {
  min-height: 56rpx;
  display: flex;
  align-items: center;
}

.batch-main-text {
  flex: 1;
  padding-left: 18rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 600;
}

.batch-info-card {
  padding: 24rpx 24rpx 22rpx;
}

.batch-section-title {
  display: block;
  color: #111827;
  font-size: 27rpx;
  font-weight: 600;
  line-height: 34rpx;
}

.batch-tool-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.batch-tool {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-size: 23rpx;
  white-space: nowrap;
}

.batch-tool text {
  margin-left: 8rpx;
}

.batch-courier-card {
  height: 80rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-panel {
  height: 280rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 28rpx;
}

.empty-desc {
  margin-top: 12rpx;
  color: #a1a1aa;
  font-size: 24rpx;
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

.goods-summary {
  margin-left: 12rpx;
  color: #9ca3af;
  font-size: 23rpx;
  font-weight: 400;
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

.courier-popup {
  padding: 12rpx 42rpx calc(28rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  box-sizing: border-box;
}

.popup-handle {
  width: 52rpx;
  height: 8rpx;
  margin: 0 auto 12rpx;
  border-radius: 8rpx;
  background: #eef0f3;
}

.popup-head {
  height: 56rpx;
  display: flex;
  align-items: center;
}

.popup-side,
.popup-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-title {
  flex: 1;
  color: #111827;
  font-size: 29rpx;
  font-weight: 700;
  text-align: center;
}

.popup-courier-row {
  min-height: 138rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f2f5;
  box-sizing: border-box;
}

.popup-logo {
  width: 54rpx;
  height: 54rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18rpx;
  font-weight: 800;
  line-height: 18rpx;
}

.popup-courier-main {
  flex: 1;
  min-width: 0;
}

.popup-name-row {
  display: flex;
  align-items: center;
}

.popup-courier-name {
  color: #1f2937;
  font-size: 27rpx;
  font-weight: 600;
}

.recommend-tag {
  height: 24rpx;
  margin-left: 10rpx;
  padding: 0 8rpx;
  border-radius: 6rpx;
  background: #4d94ff;
  color: #ffffff;
  font-size: 17rpx;
  line-height: 24rpx;
}

.popup-price-line {
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  color: #8b95a1;
  font-size: 21rpx;
}

.popup-price {
  color: #ff4d2d;
}

.popup-tag {
  display: inline-flex;
  height: 28rpx;
  margin-top: 8rpx;
  padding: 0 12rpx;
  border-radius: 4rpx;
  background: #ff6a1c;
  color: #ffffff;
  font-size: 17rpx;
  line-height: 28rpx;
  max-width: 360rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popup-radio {
  width: 34rpx;
  height: 34rpx;
  margin-left: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #c6ccd5;
  border-radius: 50%;
  box-sizing: border-box;
}

.popup-radio.checked {
  border-color: #4d94ff;
  background: #4d94ff;
}

.popup-confirm {
  height: 74rpx;
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background: #4d8df7;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.home-indicator {
  width: 236rpx;
  height: 8rpx;
  margin: 2rpx auto 0;
  border-radius: 8rpx;
  background: #111827;
}
</style>
