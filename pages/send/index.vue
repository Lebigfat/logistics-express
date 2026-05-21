<template>
  <view class="page">
    <AppHead title="寄快递" show-back></AppHead>
    <scroll-view scroll-y class="content">
      <view class="card address-card">
        <view class="address-row" @tap="pickAddress('sender')">
          <view class="dot green">寄</view>
          <view class="address-copy">
            <text class="address-title">{{ sender.name ? `${sender.name} ${sender.tel}` : '选择寄件地址' }}</text>
            <text class="address-text">{{ addressLine(sender) || '从地址簿选择 sender_id' }}</text>
          </view>
          <text class="link">地址簿</text>
        </view>
        <view class="divider"></view>
        <view class="address-row" @tap="pickAddress('recipient')">
          <view class="dot blue">收</view>
          <view class="address-copy">
            <text class="address-title">{{ recipient.name ? `${recipient.name} ${recipient.tel}` : '选择收件地址' }}</text>
            <text class="address-text">{{ addressLine(recipient) || '从地址簿选择 recipient_id' }}</text>
          </view>
          <text class="link">地址簿</text>
        </view>
      </view>

      <view class="card">
        <view class="field">
          <text>delivery_type</text>
          <input v-model="form.delivery_type" type="number" placeholder="例如 1" />
        </view>
        <view class="field">
          <text>item_type</text>
          <input v-model="form.item_type" type="number" placeholder="例如 1" />
        </view>
        <view class="field">
          <text>fragile_type</text>
          <picker :range="yesNoLabels" :value="fragileIndex" @change="form.fragile_type = yesNo[$event.detail.value].value">
            <view class="picker">{{ fragileLabel }}</view>
          </picker>
        </view>
        <view class="field">
          <text>weight</text>
          <input v-model="form.weight" type="number" placeholder="kg" />
        </view>
        <view class="field">
          <text>number</text>
          <input v-model="form.number" type="number" placeholder="件数" />
        </view>
        <view class="field">
          <text>is_bao_money</text>
          <picker :range="yesNoLabels" :value="baoIndex" @change="form.is_bao_money = yesNo[$event.detail.value].value">
            <view class="picker">{{ baoLabel }}</view>
          </picker>
        </view>
        <view class="field">
          <text>bao_money</text>
          <input v-model="form.bao_money" type="number" placeholder="未保价填 0" />
        </view>
        <view class="field">
          <text>pay_method</text>
          <input v-model="form.pay_method" type="number" placeholder="例如 1" />
        </view>
        <view class="field">
          <text>sub_date</text>
          <input v-model="form.sub_date" placeholder="YYYY-MM-DD HH:mm:ss" />
        </view>
        <view class="field">
          <text>note</text>
          <input v-model="form.note" placeholder="选填" />
        </view>
      </view>

      <view class="card estimate">
        <view class="estimate-head">
          <text>费用预估</text>
          <button :loading="estimating" :disabled="estimating" @tap="estimate">试算</button>
        </view>
        <text class="estimate-text">{{ estimateText }}</text>
      </view>
    </scroll-view>

    <view class="bottom">
      <view>
        <text class="total">¥{{ moneyText(estimateData.actual_payment_price || estimateData.yg_price || 0) }}</text>
        <text class="tip">按接口返回展示</text>
      </view>
      <button class="submit" :loading="submitting" :disabled="submitting" @tap="submit">立即下单</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import { orderApi } from '@/services/api'
import { addressLine, moneyText } from '@/utils/api-fields'

const sender = ref({})
const recipient = ref({})
const estimateData = ref({})
const estimating = ref(false)
const submitting = ref(false)

const yesNo = [
  { label: '是(1)', value: '1' },
  { label: '否(2)', value: '2' },
]
const yesNoLabels = yesNo.map((item) => item.label)

const form = reactive({
  delivery_type: '1',
  item_type: '1',
  fragile_type: '2',
  weight: '1',
  number: '1',
  is_bao_money: '2',
  bao_money: '0',
  pay_method: '1',
  sub_date: '',
  note: '',
})

const fragileIndex = computed(() => Math.max(yesNo.findIndex((item) => item.value === form.fragile_type), 0))
const baoIndex = computed(() => Math.max(yesNo.findIndex((item) => item.value === form.is_bao_money), 0))
const fragileLabel = computed(() => yesNo[fragileIndex.value].label)
const baoLabel = computed(() => yesNo[baoIndex.value].label)
const estimateText = computed(() => {
  if (!Object.keys(estimateData.value).length) return '选择地址后调用 /api/user/getMoney'
  return Object.keys(estimateData.value).map((key) => `${key}: ${estimateData.value[key]}`).join('，')
})

const pickAddress = (type) => {
  uni.navigateTo({
    url: `/pages/address/index?type=${type}`,
    events: {
      selectAddress({ type: role, address }) {
        if (role === 'sender') sender.value = address
        if (role === 'recipient') recipient.value = address
      },
    },
  })
}

const validate = () => {
  if (!sender.value?.id) return '请选择寄件地址'
  if (!recipient.value?.id) return '请选择收件地址'
  if (!form.delivery_type || !form.item_type || !form.weight || !form.number || !form.pay_method || !form.sub_date) return '请完整填写订单字段'
  return ''
}

const estimate = async () => {
  if (!sender.value?.id || !recipient.value?.id) {
    uni.showToast({ title: '请先选择地址', icon: 'none' })
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
        uni.requestPayment({
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          package: payParam.package,
          signType: payParam.signType,
          paySign: payParam.paySign,
          success: () => uni.switchTab({ url: '/pages/express/index' }),
        })
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
  border-radius: 14rpx;
  background: #ffffff;
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
  font-size: 25rpx;
  font-weight: 800;
}

.field input,
.picker {
  flex: 1;
  height: 66rpx;
  color: #4b5563;
  font-size: 25rpx;
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
  width: 128rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 56rpx;
}

.estimate-text {
  display: block;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 36rpx;
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
