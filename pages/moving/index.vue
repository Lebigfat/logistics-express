<template>
  <view class="moving-page">
    <AppHead title="同城配送" show-back />

    <scroll-view scroll-y class="content">
      <view class="notice-card">
        <text class="notice-title">本地模拟下单</text>
        <text class="notice-text">文档未提供同城配送后端接口，本页只做选车、选址、跟车和费用预估，不会发起真实下单请求。</text>
      </view>

      <view class="card">
        <view class="section-head">
          <view>
            <text class="section-title">选择车型</text>
            <text class="section-desc">按装载空间和载重做本地预估</text>
          </view>
          <text class="price-pill">预估 ¥{{ estimatedPrice }}</text>
        </view>

        <scroll-view scroll-x class="truck-strip" :show-scrollbar="false">
          <view class="truck-list">
            <view
              v-for="truck in trucks"
              :key="truck.id"
              class="truck-item"
              :class="{ active: selectedTruckId === truck.id }"
              @tap="selectTruck(truck.id)"
            >
              <text class="truck-name">{{ truck.name }}</text>
              <text class="truck-meta">{{ truck.size }}</text>
              <text class="truck-meta">{{ truck.capacity }}</text>
              <text class="truck-meta">{{ truck.load }}</text>
            </view>
          </view>
        </scroll-view>

        <view class="truck-summary">
          <view class="truck-badge">{{ selectedTruck.badge }}</view>
          <view class="summary-copy">
            <text class="summary-title">{{ selectedTruck.name }}</text>
            <text class="summary-line">{{ selectedTruck.description }}</text>
            <text class="summary-line">起步价 ¥{{ selectedTruck.basePrice }}，路线补差按本地规则计算</text>
          </view>
        </view>
      </view>

      <view class="card address-card">
        <view class="address-row" @tap="openAddressPicker('sender')">
          <view class="step-dot sender">寄</view>
          <view class="address-copy">
            <text class="address-title">{{ addressTitle(senderAddress, '选择发货地址') }}</text>
            <text class="address-main">{{ addressRegion(senderAddress, '从地址簿选择发货联系人') }}</text>
            <text class="address-sub">{{ addressDetail(senderAddress, '需要联系人、手机号和详细地址') }}</text>
          </view>
          <text class="action-text">{{ senderAddress ? '更换' : '选择' }}</text>
        </view>

        <view class="address-divider"></view>

        <view class="address-row" @tap="openAddressPicker('receiver')">
          <view class="step-dot receiver">收</view>
          <view class="address-copy">
            <text class="address-title">{{ addressTitle(receiverAddress, '选择收货地址') }}</text>
            <text class="address-main">{{ addressRegion(receiverAddress, '从地址簿选择收货联系人') }}</text>
            <text class="address-sub">{{ addressDetail(receiverAddress, '需要联系人、手机号和详细地址') }}</text>
          </view>
          <text class="action-text">{{ receiverAddress ? '更换' : '选择' }}</text>
        </view>
      </view>

      <view class="card">
        <view class="form-row">
          <view class="row-copy">
            <text class="row-label">联系电话</text>
            <text class="row-hint">用于司机联系和跟车确认</text>
          </view>
          <input
            v-model="contactPhone"
            class="text-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="form-row">
          <view class="row-copy">
            <text class="row-label">跟车服务</text>
            <text class="row-hint">{{ followEnabled ? selectedFollowOption.desc : '关闭后按司机独立配送预估' }}</text>
          </view>
          <view class="row-right">
            <switch :checked="followEnabled" color="#2563eb" @change="handleFollowSwitch" />
            <text class="select-value" @tap="openFollowSheet">{{ followEnabled ? selectedFollowOption.label : '不跟车' }}</text>
          </view>
        </view>

        <view class="form-row" @tap="openFollowSheet">
          <view class="row-copy">
            <text class="row-label">跟车选项</text>
            <text class="row-hint">到场确认或全程跟车会计入本地预估价</text>
          </view>
          <view class="row-right">
            <text class="select-value">{{ selectedFollowOption.label }}</text>
            <text class="chevron">›</text>
          </view>
        </view>

        <view class="form-row last" @tap="openRemarkEditor">
          <view class="row-copy">
            <text class="row-label">备注</text>
            <text class="row-hint">楼层、电梯、搬运限制、到达时间等</text>
          </view>
          <view class="row-right">
            <text class="remark-preview">{{ remark || '填写备注' }}</text>
            <text class="chevron">›</text>
          </view>
        </view>
      </view>

      <view class="card estimate-card">
        <view class="section-head compact">
          <view>
            <text class="section-title">费用预估</text>
            <text class="section-desc">仅本地展示，非后端报价</text>
          </view>
          <text class="estimate-total">¥{{ estimatedPrice }}</text>
        </view>

        <view class="estimate-list">
          <view v-for="item in breakdown" :key="item.label" class="estimate-item">
            <text>{{ item.label }}</text>
            <text>{{ item.amount }}</text>
          </view>
        </view>
      </view>

      <view class="gap-card">
        <text class="gap-title">待后端补齐</text>
        <text class="gap-line">缺少同城配送价格预估接口</text>
        <text class="gap-line">缺少同城配送下单接口</text>
        <text class="gap-line">缺少同城配送车型/运力/跟车服务配置接口</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="submit-summary">
        <text class="submit-price">¥{{ estimatedPrice }}</text>
        <text class="submit-tip">校验后提示接口缺口，不调用不存在的 API</text>
      </view>
      <view class="submit-btn" @tap="handleSubmit">提交订单</view>
    </view>

    <view v-if="showFollowSheet" class="mask" @tap.self="showFollowSheet = false">
      <view class="sheet">
        <text class="sheet-title">跟车选项</text>
        <view
          v-for="option in followOptions"
          :key="option.id"
          class="option-item"
          :class="{ active: selectedFollowOptionId === option.id }"
          @tap="selectFollowOption(option.id)"
        >
          <view class="option-copy">
            <text class="option-name">{{ option.label }}</text>
            <text class="option-desc">{{ option.desc }}</text>
          </view>
          <text class="option-price">{{ option.price ? `+¥${option.price}` : '¥0' }}</text>
        </view>
        <view class="sheet-actions">
          <view class="sheet-cancel" @tap="showFollowSheet = false">关闭</view>
        </view>
      </view>
    </view>

    <view v-if="showRemarkSheet" class="mask" @tap.self="showRemarkSheet = false">
      <view class="sheet">
        <text class="sheet-title">填写备注</text>
        <textarea
          v-model="remarkDraft"
          class="remark-textarea"
          maxlength="120"
          placeholder="例如：有电梯，货物在一楼门口，需 18:00 前送达"
          placeholder-class="input-placeholder"
        />
        <view class="sheet-actions">
          <view class="sheet-cancel" @tap="showRemarkSheet = false">取消</view>
          <view class="sheet-confirm" @tap="saveRemark">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'

const trucks = [
  { id: 'mini', name: '微面', size: '1.8 米', capacity: '1.2-1.8 方', load: '0.3 吨', basePrice: 68, routeFee: 12, badge: '1.8', description: '适合文件、小家电、少量纸箱' },
  { id: 'small', name: '小面', size: '2.4 米', capacity: '1.6-2.4 方', load: '0.4 吨', basePrice: 78, routeFee: 14, badge: '2.4', description: '适合日用品、行李和轻量搬运' },
  { id: 'mid', name: '中面', size: '3.0 米', capacity: '2.2-3.2 方', load: '0.6 吨', basePrice: 98, routeFee: 18, badge: '3.0', description: '适合多箱货物和小型家具' },
  { id: 'van', name: '依维柯', size: '4.2 米', capacity: '3.0-4.0 方', load: '0.8 吨', basePrice: 118, routeFee: 20, badge: '4.2', description: '适合大件、批量包裹和商户配送' },
  { id: 'cargo', name: '小货车', size: '4.2 米厢货', capacity: '4.0-6.0 方', load: '1.2 吨', basePrice: 148, routeFee: 24, badge: '厢', description: '适合门店补货和较重货物' },
  { id: 'large', name: '中货车', size: '6.8 米厢货', capacity: '8.0-12.0 方', load: '2.0 吨', basePrice: 198, routeFee: 30, badge: '中', description: '适合批量配送和大型搬运' },
]

const followOptions = [
  { id: 'none', label: '不跟车', desc: '司机独立完成运输', price: 0 },
  { id: 'assist', label: '到场确认', desc: '到场后确认装卸和签收', price: 18 },
  { id: 'full', label: '全程跟车', desc: '随车同行，按全程服务计费', price: 35 },
]

const selectedTruckId = ref('mid')
const senderAddress = ref(null)
const receiverAddress = ref(null)
const contactPhone = ref('')
const remark = ref('')
const remarkDraft = ref('')
const followEnabled = ref(false)
const selectedFollowOptionId = ref('none')
const showFollowSheet = ref(false)
const showRemarkSheet = ref(false)

const selectedTruck = computed(() => trucks.find((item) => item.id === selectedTruckId.value) || trucks[0])
const selectedFollowOption = computed(() => followOptions.find((item) => item.id === selectedFollowOptionId.value) || followOptions[0])

const phoneDisplay = (phone) => {
  const value = String(phone || '').replace(/\D/g, '')
  if (value.length !== 11) return value
  return `${value.slice(0, 3)} ${value.slice(3, 7)} ${value.slice(7)}`
}

const regionKey = (address) => {
  if (!address) return ''
  return address.region || [address.province, address.city, address.district].filter(Boolean).join(' ')
}

const splitRegion = (region) => String(region || '').split(/\s+/).filter(Boolean)

const normalizeAddress = (address) => ({
  id: address?.id ?? '',
  name: address?.name || '',
  phone: address?.phone || address?.tel || '',
  region: regionKey(address),
  detail: address?.detail || address?.address || '',
  province: address?.province || '',
  city: address?.city || '',
  district: address?.district || '',
})

const addressTitle = (address, fallback) => {
  if (!address) return fallback
  return `${address.name || '未填联系人'} ${phoneDisplay(address.phone)}`
}

const addressRegion = (address, fallback) => {
  if (!address) return fallback
  return address.region || '未填写省市区'
}

const addressDetail = (address, fallback) => {
  if (!address) return fallback
  return address.detail || '未填写详细地址'
}

const routeAdjustment = computed(() => {
  if (!senderAddress.value || !receiverAddress.value) return 0

  const senderParts = splitRegion(senderAddress.value.region)
  const receiverParts = splitRegion(receiverAddress.value.region)
  const senderCity = senderAddress.value.city || senderParts[1] || senderParts[0] || ''
  const receiverCity = receiverAddress.value.city || receiverParts[1] || receiverParts[0] || ''
  const senderDistrict = senderAddress.value.district || senderParts[2] || ''
  const receiverDistrict = receiverAddress.value.district || receiverParts[2] || ''

  if (senderCity && receiverCity && senderCity !== receiverCity) {
    return selectedTruck.value.routeFee + 18
  }

  if (senderDistrict && receiverDistrict && senderDistrict === receiverDistrict) {
    return Math.max(0, selectedTruck.value.routeFee - 4)
  }

  return selectedTruck.value.routeFee
})

const followFee = computed(() => (followEnabled.value ? selectedFollowOption.value.price : 0))
const estimatedPrice = computed(() => selectedTruck.value.basePrice + routeAdjustment.value + followFee.value)

const breakdown = computed(() => [
  { label: '车型起步价', amount: `¥${selectedTruck.value.basePrice}` },
  { label: '路线补差', amount: senderAddress.value && receiverAddress.value ? `¥${routeAdjustment.value}` : '待选择地址' },
  { label: '跟车服务', amount: followFee.value ? `¥${followFee.value}` : '¥0' },
  { label: '优惠券', amount: '未接入' },
])

const showToast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const selectTruck = (id) => {
  selectedTruckId.value = id
}

const openAddressPicker = (type) => {
  uni.navigateTo({
    url: `/pages/address/index?type=${type}`,
    success(res) {
      res.eventChannel.on('selectAddress', ({ type: selectedType, address }) => {
        const normalized = normalizeAddress(address)
        if (selectedType === 'sender') {
          senderAddress.value = normalized
          return
        }
        if (selectedType === 'receiver') {
          receiverAddress.value = normalized
        }
      })
    },
  })
}

const handleFollowSwitch = (event) => {
  followEnabled.value = Boolean(event?.detail?.value)
  if (followEnabled.value && selectedFollowOptionId.value === 'none') {
    selectedFollowOptionId.value = 'assist'
  }
  if (!followEnabled.value) {
    selectedFollowOptionId.value = 'none'
    showFollowSheet.value = false
  }
}

const openFollowSheet = () => {
  showFollowSheet.value = true
}

const selectFollowOption = (id) => {
  selectedFollowOptionId.value = id
  followEnabled.value = id !== 'none'
  showFollowSheet.value = false
}

const openRemarkEditor = () => {
  remarkDraft.value = remark.value
  showRemarkSheet.value = true
}

const saveRemark = () => {
  remark.value = remarkDraft.value.trim()
  showRemarkSheet.value = false
}

const validateAddress = (address, typeLabel) => {
  if (!address) {
    showToast(`请选择${typeLabel}地址`)
    return false
  }
  if (!address.name || !address.phone || !address.detail) {
    showToast(`${typeLabel}地址需包含联系人、手机号和详细地址`)
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(String(address.phone))) {
    showToast(`${typeLabel}手机号格式不正确`)
    return false
  }
  return true
}

const validateForm = () => {
  if (!validateAddress(senderAddress.value, '发货')) return false
  if (!validateAddress(receiverAddress.value, '收货')) return false

  if (senderAddress.value.id && receiverAddress.value.id && senderAddress.value.id === receiverAddress.value.id) {
    showToast('发货和收货地址不能相同')
    return false
  }

  const phone = String(contactPhone.value || '').trim()
  if (!phone) {
    showToast('请填写联系电话')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showToast('联系电话格式不正确')
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  uni.showModal({
    title: '同城配送后端未接入',
    content: '当前仅完成本地流程校验和费用预估。缺少同城配送价格预估接口、同城配送下单接口、同城配送车型/运力/跟车服务配置接口，因此不会调用 /api/user/placeAnOrder 或其他快递订单接口。',
    showCancel: false,
  })
}

watch(senderAddress, (address) => {
  if (!contactPhone.value && address?.phone) {
    contactPhone.value = String(address.phone)
  }
})
</script>

<style>
page {
  background: #f3f5f9;
}

.moving-page {
  min-height: 100vh;
  background: #f3f5f9;
  color: #111827;
}

.content {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 22rpx 24rpx 188rpx;
  box-sizing: border-box;
}

.notice-card,
.card,
.gap-card {
  margin-bottom: 20rpx;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.notice-card {
  padding: 22rpx;
  border-left: 8rpx solid #2563eb;
}

.notice-title {
  display: block;
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 700;
}

.notice-text {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 36rpx;
}

.card {
  padding: 24rpx 22rpx;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.section-head.compact {
  align-items: center;
}

.section-title {
  display: block;
  color: #111827;
  font-size: 32rpx;
  font-weight: 700;
}

.section-desc {
  display: block;
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.price-pill {
  min-width: 148rpx;
  height: 54rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #eef4ff;
  color: #2563eb;
  font-size: 24rpx;
  font-weight: 700;
  box-sizing: border-box;
}

.truck-strip {
  margin-top: 20rpx;
  white-space: nowrap;
}

.truck-list {
  display: flex;
  gap: 14rpx;
}

.truck-item {
  width: 160rpx;
  flex-shrink: 0;
  padding: 18rpx 14rpx;
  border-radius: 12rpx;
  background: #f7f8fb;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.truck-item.active {
  background: #eef4ff;
  border-color: #2563eb;
  color: #1d4ed8;
}

.truck-name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.truck-meta {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 1.35;
}

.truck-item.active .truck-meta {
  color: #315fbd;
}

.truck-summary {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.truck-badge {
  width: 94rpx;
  height: 94rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: #111827;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
}

.summary-copy {
  flex: 1;
  min-width: 0;
}

.summary-title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.summary-line {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 34rpx;
}

.address-card {
  padding-top: 18rpx;
  padding-bottom: 18rpx;
}

.address-row,
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.address-row {
  padding: 8rpx 0;
}

.step-dot {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.sender {
  background: #16a085;
}

.receiver {
  background: #2563eb;
}

.address-copy,
.row-copy {
  flex: 1;
  min-width: 0;
}

.address-title,
.row-label {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.address-main,
.address-sub,
.row-hint {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 34rpx;
}

.action-text {
  color: #2563eb;
  font-size: 26rpx;
  font-weight: 700;
}

.address-divider {
  height: 1rpx;
  margin: 16rpx 0;
  background: #edf1f6;
}

.form-row {
  min-height: 110rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #edf1f6;
  box-sizing: border-box;
}

.form-row.last {
  border-bottom: none;
}

.row-right {
  max-width: 310rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  color: #374151;
}

.text-input {
  width: 270rpx;
  height: 64rpx;
  padding: 0 18rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  color: #111827;
  font-size: 26rpx;
  text-align: right;
  box-sizing: border-box;
}

.input-placeholder {
  color: #a7b0be;
}

.select-value,
.remark-preview {
  color: #374151;
  font-size: 26rpx;
  font-weight: 600;
  text-align: right;
}

.remark-preview {
  max-width: 250rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: #9ca3af;
  font-size: 38rpx;
  line-height: 1;
}

.estimate-list {
  margin-top: 18rpx;
}

.estimate-item {
  min-height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f1f5f9;
  color: #374151;
  font-size: 26rpx;
}

.estimate-item:last-child {
  border-bottom: none;
}

.estimate-total {
  color: #f97316;
  font-size: 38rpx;
  font-weight: 800;
}

.gap-card {
  padding: 22rpx;
}

.gap-title {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
}

.gap-line {
  display: block;
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.bottom-space {
  height: 24rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -8rpx 24rpx rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
  z-index: 9;
}

.submit-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.submit-price {
  color: #f97316;
  font-size: 40rpx;
  font-weight: 800;
}

.submit-tip {
  flex: 1;
  color: #8b95a7;
  font-size: 22rpx;
  text-align: right;
}

.submit-btn {
  height: 86rpx;
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #2563eb;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
}

.mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.45);
  z-index: 99;
}

.sheet {
  width: 100%;
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 22rpx 22rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
}

.sheet-title {
  display: block;
  margin-bottom: 18rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.option-item {
  padding: 18rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf1f6;
}

.option-item.active {
  color: #2563eb;
}

.option-copy {
  flex: 1;
  min-width: 0;
}

.option-name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.option-desc {
  display: block;
  margin-top: 6rpx;
  color: #6b7280;
  font-size: 23rpx;
}

.option-price {
  margin-left: 18rpx;
  color: #f97316;
  font-size: 26rpx;
  font-weight: 700;
}

.sheet-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 22rpx;
}

.sheet-cancel,
.sheet-confirm {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.sheet-cancel {
  background: #f3f4f6;
  color: #374151;
}

.sheet-confirm {
  background: #2563eb;
  color: #ffffff;
}

.remark-textarea {
  width: 100%;
  height: 190rpx;
  padding: 18rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  color: #111827;
  font-size: 26rpx;
  line-height: 38rpx;
  box-sizing: border-box;
}
</style>
