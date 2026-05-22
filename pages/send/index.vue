<template>
  <view class="page">
    <AppHead title="寄快递" show-back></AppHead>
    <scroll-view scroll-y class="content">
      <view class="card address-card">
        <view class="address-row" @tap="pickAddress('sender')">
          <view class="dot green">寄</view>
          <view class="address-copy">
            <text class="address-title">{{ sender.name ? `${sender.name} ${sender.tel}` : '选择寄件人' }}</text>
            <text class="address-text">{{ addressLine(sender) || '请选择寄件地址' }}</text>
          </view>
          <text class="link">地址簿</text>
        </view>
        <view class="divider"></view>
        <view class="address-row" @tap="pickAddress('recipient')">
          <view class="dot blue">收</view>
          <view class="address-copy">
            <text class="address-title">{{ recipient.name ? `${recipient.name} ${recipient.tel}` : '选择收件人' }}</text>
            <text class="address-text">{{ addressLine(recipient) || '请选择收件地址' }}</text>
          </view>
          <text class="link">地址簿</text>
        </view>
      </view>

      <view class="card section-card">
        <view class="section-title">快递信息</view>
        <view class="field">
          <text>快递类型</text>
          <picker :range="deliveryLabels" :value="deliveryIndex" @change="onDeliveryChange">
            <view class="picker">{{ deliveryLabel || '请选择快递类型' }}</view>
          </picker>
        </view>
        <view class="field">
          <text>物品类型</text>
          <picker :range="itemLabels" :value="itemIndex" @change="onItemChange">
            <view class="picker">{{ itemLabel || '请选择物品类型' }}</view>
          </picker>
        </view>
        <view class="field">
          <text>是否易碎</text>
          <picker :range="yesNoLabels" :value="fragileIndex" @change="form.fragile_type = yesNo[$event.detail.value].value">
            <view class="picker">{{ fragileLabel }}</view>
          </picker>
        </view>
        <view class="field">
          <text>预估重量</text>
          <input v-model="form.weight" type="digit" placeholder="请输入 kg" @blur="estimateIfReady" />
        </view>
        <view class="field">
          <text>件数</text>
          <input v-model="form.number" type="number" placeholder="请输入件数" />
        </view>
      </view>

      <view class="card section-card">
        <view class="section-title">付款与预约</view>
        <view class="field">
          <text>保价服务</text>
          <picker :range="yesNoLabels" :value="baoIndex" @change="onBaoChange">
            <view class="picker">{{ baoLabel }}</view>
          </picker>
        </view>
        <view v-if="form.is_bao_money === '1'" class="field">
          <text>保价金额</text>
          <input v-model="form.bao_money" type="digit" placeholder="请输入金额" />
        </view>
        <view class="field">
          <text>付款方式</text>
          <picker :range="payLabels" :value="payIndex" @change="form.pay_method = payMethods[$event.detail.value].value">
            <view class="picker">{{ payLabel }}</view>
          </picker>
        </view>
        <view class="field">
          <text>预约日期</text>
          <picker mode="date" :value="selectedDate" @change="onDateChange">
            <view class="picker">{{ selectedDate || '请选择日期' }}</view>
          </picker>
        </view>
        <view class="field">
          <text>预约时间</text>
          <picker mode="time" :value="selectedTime" @change="onTimeChange">
            <view class="picker">{{ selectedTime || '请选择时间' }}</view>
          </picker>
        </view>
        <view class="field note-field">
          <text>备注</text>
          <input v-model="form.note" placeholder="选填，如易碎品请轻放" />
        </view>
      </view>

      <view class="card estimate">
        <view class="estimate-head">
          <text>费用预估</text>
          <button :loading="estimating" :disabled="estimating" @tap="estimate">重新试算</button>
        </view>
        <view class="price-grid">
          <view>
            <text>预估运费</text>
            <text>¥{{ moneyText(estimateData.yg_price || 0) }}</text>
          </view>
          <view>
            <text>优惠金额</text>
            <text>-¥{{ moneyText(estimateData.yh_price || 0) }}</text>
          </view>
          <view>
            <text>预计支付</text>
            <text class="red">¥{{ moneyText(payableAmount) }}</text>
          </view>
        </view>
        <text v-if="estimateHint" class="estimate-text">{{ estimateHint }}</text>
      </view>

      <view v-if="ruleText" class="card rule-card">
        <text class="rule-title">计费/禁寄说明</text>
        <text class="rule-text">{{ ruleText }}</text>
      </view>
    </scroll-view>

    <view class="bottom">
      <view>
        <text class="total">¥{{ moneyText(payableAmount) }}</text>
        <text class="tip">最终金额以后端返回为准</text>
      </view>
      <button class="submit" :loading="submitting" :disabled="submitting" @tap="submit">立即下单</button>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import { orderApi, userApi } from '@/services/api'
import { addressLine, moneyText } from '@/utils/api-fields'
import { paymentErrorMessage, requestWechatPayment } from '@/utils/payment'

const sender = ref({})
const recipient = ref({})
const estimateData = ref({})
const estimating = ref(false)
const submitting = ref(false)
const deliveryOptions = ref([])
const itemOptions = ref([])
const forbiddenText = ref('')
const billingText = ref('')

const yesNo = [
  { label: '是', value: '1' },
  { label: '否', value: '2' },
]
const payMethods = [
  { label: '寄付', value: '1' },
  { label: '到付', value: '2' },
]
const yesNoLabels = yesNo.map((item) => item.label)
const payLabels = payMethods.map((item) => item.label)

const form = reactive({
  delivery_type: '',
  item_type: '',
  fragile_type: '2',
  weight: '1',
  number: '1',
  is_bao_money: '2',
  bao_money: '0',
  pay_method: '1',
  sub_date: '',
  note: '',
})

const pad = (num) => String(num).padStart(2, '0')
const todayDate = () => {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const selectedDate = ref(todayDate())
const selectedTime = ref('09:00')

const normalizeOptions = (data) => {
  if (!Array.isArray(data)) return []
  return data.map((item, index) => ({
    label: item.value || item.label || String(item.name || item.title || index + 1),
    value: String(item.index ?? item.value ?? index + 1),
  }))
}

const stringifyRule = (data) => {
  if (Array.isArray(data)) return data.map((item) => item.value || item.label || item.desc || JSON.stringify(item)).join('\n')
  if (data && typeof data === 'object') return data.content || data.desc || JSON.stringify(data)
  return data ? String(data) : ''
}

const deliveryLabels = computed(() => deliveryOptions.value.map((item) => item.label))
const itemLabels = computed(() => itemOptions.value.map((item) => item.label))
const deliveryIndex = computed(() => Math.max(deliveryOptions.value.findIndex((item) => item.value === form.delivery_type), 0))
const itemIndex = computed(() => Math.max(itemOptions.value.findIndex((item) => item.value === form.item_type), 0))
const deliveryLabel = computed(() => deliveryOptions.value[deliveryIndex.value]?.label || '')
const itemLabel = computed(() => itemOptions.value[itemIndex.value]?.label || '')
const fragileIndex = computed(() => Math.max(yesNo.findIndex((item) => item.value === form.fragile_type), 0))
const baoIndex = computed(() => Math.max(yesNo.findIndex((item) => item.value === form.is_bao_money), 0))
const payIndex = computed(() => Math.max(payMethods.findIndex((item) => item.value === form.pay_method), 0))
const fragileLabel = computed(() => yesNo[fragileIndex.value].label)
const baoLabel = computed(() => yesNo[baoIndex.value].label)
const payLabel = computed(() => payMethods[payIndex.value].label)
const payableAmount = computed(() => Math.max(Number(estimateData.value.yg_price || 0) - Number(estimateData.value.yh_price || 0), 0))
const estimateHint = computed(() => {
  if (!Object.keys(estimateData.value).length) return '选择寄收地址后，可按接口 /api/user/getMoney 试算运费。'
  if (Number(estimateData.value.isNewcomer) === 1) return '已按新人优惠试算。'
  return estimateData.value.discount ? `当前折扣：${estimateData.value.discount}` : ''
})
const ruleText = computed(() => [billingText.value, forbiddenText.value].filter(Boolean).join('\n\n'))

const syncSubDate = () => {
  if (selectedDate.value && selectedTime.value) form.sub_date = `${selectedDate.value} ${selectedTime.value}:00`
}

const onDeliveryChange = (event) => {
  const option = deliveryOptions.value[event.detail.value]
  if (option) form.delivery_type = option.value
  estimateIfReady()
}

const onItemChange = (event) => {
  const option = itemOptions.value[event.detail.value]
  if (option) form.item_type = option.value
}

const onBaoChange = (event) => {
  form.is_bao_money = yesNo[event.detail.value].value
  if (form.is_bao_money === '2') form.bao_money = '0'
}

const onDateChange = (event) => {
  selectedDate.value = event.detail.value
  syncSubDate()
  estimateIfReady()
}

const onTimeChange = (event) => {
  selectedTime.value = event.detail.value
  syncSubDate()
  estimateIfReady()
}

const pickAddress = (type) => {
  uni.navigateTo({
    url: `/pages/address/index?type=${type}`,
    events: {
      selectAddress({ type: role, address }) {
        if (role === 'sender') sender.value = address
        if (role === 'recipient') recipient.value = address
        estimateIfReady()
      },
    },
  })
}

const validate = () => {
  if (!sender.value?.id) return '请选择寄件地址'
  if (!recipient.value?.id) return '请选择收件地址'
  if (!form.delivery_type) return '请选择快递类型'
  if (!form.item_type) return '请选择物品类型'
  if (!form.weight || Number(form.weight) <= 0) return '请输入有效重量'
  if (!form.number || Number(form.number) <= 0) return '请输入有效件数'
  if (form.is_bao_money === '1' && (!form.bao_money || Number(form.bao_money) <= 0)) return '请输入保价金额'
  if (!form.pay_method || !form.sub_date) return '请完整填写预约与付款信息'
  return ''
}

const estimate = async () => {
  if (!sender.value?.id || !recipient.value?.id) {
    uni.showToast({ title: '请先选择寄收地址', icon: 'none' })
    return
  }
  if (!form.delivery_type || !form.weight || !form.sub_date) {
    uni.showToast({ title: '请完善快递类型、重量和预约时间', icon: 'none' })
    return
  }
  estimating.value = true
  try {
    estimateData.value = await orderApi.estimate({
      sender_id: sender.value.id,
      recipient_id: recipient.value.id,
      businessType: form.delivery_type,
      weight: form.weight,
      consignedTime: form.sub_date,
    })
  } catch (error) {
    uni.showToast({ title: error.message || '试算失败', icon: 'none' })
  } finally {
    estimating.value = false
  }
}

const estimateIfReady = () => {
  if (sender.value?.id && recipient.value?.id && form.delivery_type && form.weight && form.sub_date) estimate()
}

const submit = async () => {
  const message = validate()
  if (message) {
    uni.showToast({ title: message, icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const data = await orderApi.create({
      sender_id: sender.value.id,
      recipient_id: recipient.value.id,
      delivery_type: form.delivery_type,
      item_type: form.item_type,
      fragile_type: form.fragile_type,
      weight: form.weight,
      number: form.number,
      is_bao_money: form.is_bao_money,
      bao_money: form.bao_money,
      pay_method: form.pay_method,
      sub_date: form.sub_date,
      note: form.note,
    })
    const id = data?.id || data?.order_id
    if (id && form.pay_method === '1') {
      const payData = await orderApi.pay(id)
      const payParam = payData?.payParam
      if (payParam) {
        try {
          await requestWechatPayment(payParam)
          uni.showToast({ title: '支付成功', icon: 'none' })
          uni.switchTab({ url: '/pages/express/index' })
        } catch (paymentError) {
          uni.showToast({ title: paymentErrorMessage(paymentError), icon: 'none' })
        }
        return
      }
    }
    uni.showToast({ title: '下单成功', icon: 'none' })
    uni.switchTab({ url: '/pages/express/index' })
  } catch (error) {
    uni.showToast({ title: error.message || '下单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const loadConfigs = async () => {
  try {
    const [delivery, items, forbidden, billing] = await Promise.all([
      userApi.getConfig('deliveryType'),
      userApi.getConfig('itemInfo'),
      userApi.getConfig('forbiddenItems').catch(() => ''),
      userApi.getConfig('billingRules').catch(() => ''),
    ])
    deliveryOptions.value = normalizeOptions(delivery)
    itemOptions.value = normalizeOptions(items)
    forbiddenText.value = stringifyRule(forbidden)
    billingText.value = stringifyRule(billing)
    if (!form.delivery_type && deliveryOptions.value[0]) form.delivery_type = deliveryOptions.value[0].value
    if (!form.item_type && itemOptions.value[0]) form.item_type = itemOptions.value[0].value
  } catch (error) {
    uni.showToast({ title: error.message || '配置加载失败', icon: 'none' })
  }
}

watch(() => form.weight, () => {
  estimateData.value = {}
})

onMounted(() => {
  syncSubDate()
  loadConfigs()
})
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.content {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 24rpx 28rpx 170rpx;
  box-sizing: border-box;
}

.card {
  margin-bottom: 22rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(32, 70, 128, 0.04);
}

.address-row {
  min-height: 96rpx;
  display: flex;
  align-items: center;
}

.dot {
  width: 66rpx;
  height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
}

.green {
  background: #10b981;
}

.blue {
  background: #438bff;
}

.address-copy {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.address-title,
.address-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-title {
  color: #111827;
  font-size: 29rpx;
  font-weight: 800;
}

.address-text {
  margin-top: 8rpx;
  color: #8b95a1;
  font-size: 24rpx;
}

.link {
  color: #438bff;
  font-size: 25rpx;
}

.divider {
  height: 1rpx;
  margin: 22rpx 0 22rpx 88rpx;
  background: #edf0f5;
}

.section-title {
  margin-bottom: 12rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.field {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #edf0f5;
}

.field:last-child {
  border-bottom: none;
}

.field text {
  width: 190rpx;
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.field input,
.picker {
  flex: 1;
  height: 66rpx;
  color: #4b5563;
  font-size: 26rpx;
  line-height: 66rpx;
  text-align: right;
}

.estimate-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.estimate-head text {
  font-size: 29rpx;
  font-weight: 800;
}

.estimate-head button {
  width: 150rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 56rpx;
}

.price-grid {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.price-grid view {
  min-height: 112rpx;
  padding: 16rpx 10rpx;
  border-radius: 14rpx;
  background: #f6f9ff;
  text-align: center;
}

.price-grid text {
  display: block;
  color: #8b95a1;
  font-size: 22rpx;
}

.price-grid text:last-child {
  margin-top: 12rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
}

.price-grid .red {
  color: #ef4444;
}

.estimate-text {
  display: block;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 36rpx;
}

.rule-title {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
}

.rule-text {
  display: block;
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 38rpx;
  white-space: pre-wrap;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  box-sizing: border-box;
}

.total {
  display: block;
  color: #ef4444;
  font-size: 36rpx;
  font-weight: 800;
}

.tip {
  display: block;
  margin-top: 4rpx;
  color: #9ca3af;
  font-size: 22rpx;
}

.submit {
  width: 250rpx;
  height: 82rpx;
  border-radius: 12rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 82rpx;
}
</style>
