<template>
  <view class="send-page">
    <AppHead :title="pageTitle" background-color="#ffffff" title-color="#111827" icon-color="#111827">
      <template #left>
        <view class="head-back" @tap="handleBack">
          <UvIcon name="arrow-left" color="#1f2937" size="21"></UvIcon>
        </view>
      </template>
      <template #right>
        <view class="capsule">
          <UvIcon name="more-dot-fill" color="#000000" size="20"></UvIcon>
          <view class="capsule-line"></view>
          <view class="capsule-circle"></view>
        </view>
      </template>
    </AppHead>

    <template v-if="pageMode === 'main'">
      <scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @tap="changeTab(tab.key)"
        >
          {{ tab.label }}
        </view>
      </scroll-view>

      <scroll-view scroll-y class="content">
        <view v-if="activeTab !== 'normal'" class="api-missing-card">
          <view class="missing-title">{{ currentTabLabel }}后端能力未提供</view>
          <text class="missing-desc">{{ missingApiMessage }}</text>
        </view>

        <view class="address-card">
          <view class="address-line" @tap="openAddressPicker('sender')">
            <view class="step">
              <view class="step-dot sender">寄</view>
              <view class="step-wire"></view>
            </view>
            <view class="address-copy">
              <text class="address-title">{{ addressTitle(senderAddress, '请选择寄件人') }}</text>
              <text class="address-desc">{{ addressDetail(senderAddress, '从地址簿选择寄件地址') }}</text>
            </view>
            <view class="book-link">地址簿</view>
          </view>
          <view class="address-divider"></view>
          <view class="address-line" @tap="openAddressPicker('receiver')">
            <view class="step">
              <view class="step-dot receiver">收</view>
            </view>
            <view class="address-copy">
              <text class="address-title">{{ addressTitle(receiverAddress, '请选择收件人') }}</text>
              <text class="address-desc">{{ addressDetail(receiverAddress, '从地址簿选择收件地址') }}</text>
            </view>
            <view class="book-link">地址簿</view>
          </view>
        </view>

        <view v-if="activeTab === 'batch'" class="form-card">
          <view class="section-head">
            <text>批量收件人</text>
            <text class="section-count">{{ batchReceivers.length }} 人</text>
          </view>
          <textarea
            v-model="batchText"
            class="batch-textarea"
            placeholder="每行一个收件人，格式示例：张三 13800138000 四川省 成都市 高新区 天府大道1号"
            placeholder-class="placeholder"
          />
          <view class="inline-actions">
            <view class="outline-action" @tap="addReceiverFromCurrent">加入当前收件人</view>
            <view class="primary-action" @tap="parseBatchReceivers">本地识别</view>
          </view>
          <view v-if="batchReceivers.length" class="receiver-list">
            <view v-for="(item, index) in batchReceivers" :key="`${item.phone}-${index}`" class="receiver-item">
              <view>
                <text class="receiver-name">{{ item.name || `收件人${index + 1}` }}</text>
                <text class="receiver-phone">{{ item.phone || '未识别手机号' }}</text>
              </view>
              <text class="receiver-address">{{ item.address || '地址待补充' }}</text>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'large'" class="form-card">
          <view class="section-head">
            <text>大件信息</text>
            <text class="section-hint">本地草稿</text>
          </view>
          <view class="field-row">
            <text class="field-label">预估重量</text>
            <input v-model="goodsForm.weight" class="field-input" type="number" placeholder="30" />
            <text class="field-unit">kg</text>
          </view>
          <view class="field-row">
            <text class="field-label">体积尺寸</text>
            <input v-model="goodsForm.length" class="size-input" type="number" placeholder="长" />
            <input v-model="goodsForm.width" class="size-input" type="number" placeholder="宽" />
            <input v-model="goodsForm.height" class="size-input" type="number" placeholder="高" />
            <text class="field-unit">cm</text>
          </view>
          <view class="hint-box">文档只提供通用快递下单接口，未提供大件专属服务类型、车型、加收规则或大件下单接口。</view>
        </view>

        <view v-if="activeTab === 'business'" class="form-card">
          <view class="section-head">
            <text>商家寄件</text>
            <text class="section-hint">本地草稿</text>
          </view>
          <view class="field-row">
            <text class="field-label">店铺/公司</text>
            <input v-model="businessForm.company" class="field-input" placeholder="请输入名称" />
          </view>
          <view class="field-row">
            <text class="field-label">外部单号</text>
            <input v-model="businessForm.tradeNo" class="field-input" placeholder="选填" />
          </view>
          <view class="field-row">
            <text class="field-label">结算方式</text>
            <view class="segmented">
              <view
                v-for="item in businessPayOptions"
                :key="item.value"
                class="segmented-item"
                :class="{ active: businessForm.settleType === item.value }"
                @tap="businessForm.settleType = item.value"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
          <view class="hint-box">文档未提供商家客户、月结、电子面单或批量商家下单接口，本页仅保留填写和本地校验流程。</view>
        </view>

        <view class="form-card">
          <view class="cell head-cell" @tap="pageMode = 'goods'">
            <view>
              <view class="cell-title-row">
                <text class="cell-title">物品信息</text>
                <text v-if="!goodsSaved" class="required">必填</text>
              </view>
              <text class="cell-subtitle">{{ goodsSaved ? goodsSummary : '类型、重量、件数、保价' }}</text>
            </view>
            <UvIcon name="arrow-right" color="#9ca3af" size="16"></UvIcon>
          </view>
          <view class="cell">
            <text class="cell-title">快递类型</text>
            <picker :range="deliveryLabels" :value="deliveryIndex" @change="handleDeliveryChange">
              <view class="picker-value">{{ selectedDeliveryLabel }}</view>
            </picker>
          </view>
          <view class="cell">
            <text class="cell-title">预约日期</text>
            <picker mode="date" :value="scheduleDate" @change="scheduleDate = $event.detail.value">
              <view class="picker-value">{{ scheduleDate }}</view>
            </picker>
          </view>
          <view class="cell">
            <text class="cell-title">预约时间</text>
            <picker mode="time" :value="scheduleTime" @change="scheduleTime = $event.detail.value">
              <view class="picker-value">{{ scheduleTime }}</view>
            </picker>
          </view>
          <view class="cell">
            <text class="cell-title">付款方式</text>
            <view class="segmented pay-segmented">
              <view
                v-for="item in payMethods"
                :key="item.value"
                class="segmented-item"
                :class="{ active: payMethod === item.value }"
                @tap="payMethod = item.value"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
          <view class="cell note-cell">
            <text class="cell-title">备注</text>
            <input v-model="note" class="note-input" placeholder="给快递员留言，选填" />
          </view>
        </view>

        <view class="estimate-card">
          <view class="section-head">
            <text>费用预估</text>
            <text class="section-hint">{{ estimating ? '试算中' : estimateStateText }}</text>
          </view>
          <view class="money-row">
            <text>预估运费</text>
            <text class="money">¥{{ moneyText(estimateInfo.yg_price) }}</text>
          </view>
          <view class="money-row">
            <text>优惠金额</text>
            <text>-¥{{ moneyText(estimateInfo.yh_price) }}</text>
          </view>
          <view class="money-row">
            <text>折扣</text>
            <text>{{ estimateInfo.discount ? `${estimateInfo.discount}折` : '无' }}</text>
          </view>
          <view class="actual-row">
            <text>预计实付</text>
            <text>¥{{ actualAmountText }}</text>
          </view>
        </view>

        <view v-if="forbiddenText || billingText" class="rules-card">
          <view v-if="forbiddenText" class="rule-block">
            <text class="rule-title">禁寄说明</text>
            <text class="rule-content">{{ forbiddenText }}</text>
          </view>
          <view v-if="billingText" class="rule-block">
            <text class="rule-title">计费规则</text>
            <text class="rule-content">{{ billingText }}</text>
          </view>
        </view>

        <view class="bottom-space"></view>
      </scroll-view>

      <view class="submit-bar">
        <view class="submit-copy">
          <view class="submit-price">
            <text>合计</text>
            <text class="submit-money">¥{{ activeTab === 'normal' ? actualAmountText : '0.00' }}</text>
          </view>
          <text class="submit-tip">{{ submitTip }}</text>
        </view>
        <view class="submit-button" :class="{ disabled: submitting }" @tap="submitCurrentFlow">
          {{ submitButtonText }}
        </view>
      </view>
    </template>

    <template v-else>
      <scroll-view scroll-y class="goods-scroll">
        <view class="goods-section">
          <text class="goods-label">物品类型</text>
          <view class="goods-grid">
            <view
              v-for="item in itemOptions"
              :key="item.index"
              class="goods-type"
              :class="{ active: goodsForm.itemIndex === item.index }"
              @tap="goodsForm.itemIndex = item.index"
            >
              {{ item.value }}
            </view>
          </view>
        </view>

        <view class="form-card goods-form-card">
          <view class="field-row">
            <text class="field-label">是否易碎</text>
            <view class="segmented">
              <view
                v-for="item in yesNoOptions"
                :key="item.value"
                class="segmented-item"
                :class="{ active: goodsForm.fragileType === item.value }"
                @tap="goodsForm.fragileType = item.value"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
          <view class="field-row">
            <text class="field-label">预估重量</text>
            <input v-model="goodsForm.weight" class="field-input" type="number" placeholder="请输入整数" />
            <text class="field-unit">kg</text>
          </view>
          <view class="field-row">
            <text class="field-label">件数</text>
            <view class="stepper">
              <view class="stepper-btn" @tap="changeNumber(-1)">-</view>
              <text class="stepper-value">{{ goodsForm.number }}</text>
              <view class="stepper-btn" @tap="changeNumber(1)">+</view>
            </view>
          </view>
          <view class="field-row">
            <text class="field-label">是否保价</text>
            <view class="segmented">
              <view
                v-for="item in yesNoOptions"
                :key="item.value"
                class="segmented-item"
                :class="{ active: goodsForm.isBaoMoney === item.value }"
                @tap="goodsForm.isBaoMoney = item.value"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
          <view v-if="goodsForm.isBaoMoney === '1'" class="field-row">
            <text class="field-label">保价金额</text>
            <input v-model="goodsForm.baoMoney" class="field-input" type="number" placeholder="请输入金额" />
            <text class="field-unit">元</text>
          </view>
          <view class="field-row">
            <text class="field-label">体积尺寸</text>
            <input v-model="goodsForm.length" class="size-input" type="number" placeholder="长" />
            <input v-model="goodsForm.width" class="size-input" type="number" placeholder="宽" />
            <input v-model="goodsForm.height" class="size-input" type="number" placeholder="高" />
            <text class="field-unit">cm</text>
          </view>
        </view>

        <view class="goods-note">
          <text>重量字段按文档要求只提交 kg 整数；体积尺寸用于本地提示，当前下单接口没有体积字段。</text>
          <text>保价按文档字段 is_bao_money 与 bao_money 提交；未保价时金额提交 0。</text>
        </view>
      </scroll-view>
      <view class="save-bar">
        <view class="save-btn" @tap="saveGoods">保存</view>
      </view>
    </template>

    <view v-if="addressPickerVisible" class="popup-mask" @tap.self="addressPickerVisible = false">
      <view class="address-popup">
        <view class="popup-head">
          <text>{{ pickingRole === 'sender' ? '选择寄件地址' : '选择收件地址' }}</text>
          <view class="close-btn" @tap="addressPickerVisible = false">×</view>
        </view>
        <view v-if="addressLoading" class="popup-empty">地址加载中...</view>
        <view v-else-if="!addressList.length" class="popup-empty">
          <text>暂无地址</text>
          <text class="popup-empty-desc">本页仅允许使用 addressApi.list/detail，新增地址请到地址簿维护。</text>
        </view>
        <scroll-view v-else scroll-y class="address-popup-list">
          <view v-for="item in addressList" :key="item.id" class="address-option" @tap="selectAddress(item)">
            <view class="address-option-head">
              <text>{{ item.name || '未命名' }}</text>
              <text>{{ item.phone || '-' }}</text>
            </view>
            <text class="address-option-detail">{{ addressDetail(item, '-') }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { addressApi, orderApi, userApi } from '@/services/api'

const tabs = [
  { key: 'normal', label: '寄快递' },
  { key: 'batch', label: '批量寄件' },
  { key: 'large', label: '寄大件' },
  { key: 'business', label: '商家寄件' },
]

const payMethods = [
  { label: '寄付', value: '1' },
  { label: '到付', value: '2' },
]

const yesNoOptions = [
  { label: '是', value: '1' },
  { label: '否', value: '2' },
]

const businessPayOptions = [
  { label: '现付', value: 'cash' },
  { label: '月结', value: 'monthly' },
]

const fallbackDeliveryOptions = [
  { index: 1, value: '标准快递' },
  { index: 2, value: '特快' },
]

const fallbackItemOptions = [
  { index: 1, value: '文件' },
  { index: 2, value: '电子产品' },
  { index: 3, value: '食品' },
  { index: 4, value: '服装鞋帽' },
  { index: 5, value: '其他' },
]

const pageMode = ref('main')
const activeTab = ref('normal')
const senderAddress = ref(null)
const receiverAddress = ref(null)
const addressList = ref([])
const addressLoading = ref(false)
const addressPickerVisible = ref(false)
const pickingRole = ref('sender')
const deliveryOptions = ref(fallbackDeliveryOptions)
const itemOptions = ref(fallbackItemOptions)
const selectedDeliveryIndex = ref(fallbackDeliveryOptions[0].index)
const scheduleDate = ref('')
const scheduleTime = ref('16:00')
const payMethod = ref('1')
const note = ref('')
const goodsSaved = ref(false)
const estimateInfo = ref({})
const estimating = ref(false)
const submitting = ref(false)
const forbiddenText = ref('')
const billingText = ref('')
const batchText = ref('')
const batchReceivers = ref([])

const goodsForm = reactive({
  itemIndex: fallbackItemOptions[0].index,
  fragileType: '2',
  weight: '1',
  number: 1,
  isBaoMoney: '2',
  baoMoney: '',
  length: '',
  width: '',
  height: '',
})

const businessForm = reactive({
  company: '',
  tradeNo: '',
  settleType: 'cash',
})

const pageTitle = computed(() => (pageMode.value === 'goods' ? '物品信息' : '快递下单'))
const currentTabLabel = computed(() => tabs.find((item) => item.key === activeTab.value)?.label || '')
const selectedDeliveryLabel = computed(() => deliveryOptions.value.find((item) => item.index === selectedDeliveryIndex.value)?.value || '请选择')
const deliveryLabels = computed(() => deliveryOptions.value.map((item) => item.value))
const deliveryIndex = computed(() => Math.max(deliveryOptions.value.findIndex((item) => item.index === selectedDeliveryIndex.value), 0))
const selectedItem = computed(() => itemOptions.value.find((item) => item.index === goodsForm.itemIndex) || itemOptions.value[0])
const goodsSummary = computed(() => `${selectedItem.value?.value || '-'}，${normalizedWeight.value}kg，${goodsForm.number}件`)
const normalizedWeight = computed(() => Math.max(1, Math.ceil(Number(goodsForm.weight || 1))))
const subDate = computed(() => `${scheduleDate.value} ${scheduleTime.value}:00`)

const missingApiMessage = computed(() => {
  if (activeTab.value === 'batch') return '文档没有批量下单、Excel 导入或批量地址解析接口；本页只保留本地识别和草稿校验。'
  if (activeTab.value === 'large') return '文档没有大件专属报价、车型、体积计费或大件下单接口；本页只保留本地大件信息流程。'
  if (activeTab.value === 'business') return '文档没有商家账号、月结、电子面单或商家批量下单接口；本页只保留本地商家信息流程。'
  return ''
})

const estimateStateText = computed(() => {
  if (!senderAddress.value?.id || !receiverAddress.value?.id) return '选择地址后试算'
  if (!goodsSaved.value) return '保存物品后试算'
  return estimateInfo.value?.yg_price !== undefined ? '已按接口试算' : '暂无报价'
})

const actualAmount = computed(() => {
  const freight = Number(estimateInfo.value?.yg_price || 0)
  const discount = Number(estimateInfo.value?.yh_price || 0)
  return Math.max(freight - discount, 0)
})

const actualAmountText = computed(() => moneyText(actualAmount.value))
const submitButtonText = computed(() => (activeTab.value === 'normal' ? (payMethod.value === '1' ? '立即下单并支付' : '立即下单') : '保存本地草稿'))
const submitTip = computed(() => (activeTab.value === 'normal' ? '费用以接口试算和支付结果为准' : '当前类型缺少后端下单接口'))

const moneyText = (value) => Number(value || 0).toFixed(2)

const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const pad = (num) => String(num).padStart(2, '0')

const initSchedule = () => {
  const date = new Date()
  scheduleDate.value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const normalizeConfig = (data, fallback) => {
  const rows = Array.isArray(data) ? data : []
  const normalized = rows
    .map((item) => ({
      index: Number(item.index),
      value: String(item.value || '').trim(),
    }))
    .filter((item) => item.index && item.value)
  return normalized.length ? normalized : fallback
}

const configToText = (data) => {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map((item) => item.value || item.content || item.desc || '').filter(Boolean).join('；')
  if (data && typeof data === 'object') return data.value || data.content || data.desc || JSON.stringify(data)
  return ''
}

const loadConfig = async () => {
  try {
    const [deliveryType, itemInfo, forbiddenItems, billingRules] = await Promise.all([
      userApi.getConfig('deliveryType'),
      userApi.getConfig('itemInfo'),
      userApi.getConfig('forbiddenItems'),
      userApi.getConfig('billingRules'),
    ])
    deliveryOptions.value = normalizeConfig(deliveryType, fallbackDeliveryOptions)
    itemOptions.value = normalizeConfig(itemInfo, fallbackItemOptions)
    selectedDeliveryIndex.value = deliveryOptions.value[0]?.index || 1
    goodsForm.itemIndex = itemOptions.value[0]?.index || 1
    forbiddenText.value = configToText(forbiddenItems)
    billingText.value = configToText(billingRules)
  } catch (error) {
    console.warn('load config failed', error)
    toast('配置加载失败，已使用本地默认值')
  }
}

const normalizeAddress = (item = {}) => ({
  id: item.id,
  name: item.name || '',
  phone: item.tel || item.phone || '',
  province: item.province || '',
  city: item.city || '',
  district: item.district || '',
  address: item.address || item.detail || '',
})

const loadAddressList = async () => {
  addressLoading.value = true
  try {
    const data = await addressApi.list({ page: 1, pageSize: 50, search: '' })
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    addressList.value = rows.map(normalizeAddress)
  } catch (error) {
    console.warn('load address list failed', error)
    addressList.value = []
    toast(error.message || '地址加载失败')
  } finally {
    addressLoading.value = false
  }
}

const openAddressPicker = async (role) => {
  pickingRole.value = role
  addressPickerVisible.value = true
  if (!addressList.value.length) await loadAddressList()
}

const selectAddress = async (item) => {
  try {
    const data = await addressApi.detail(item.id)
    const address = normalizeAddress(data || item)
    if (pickingRole.value === 'sender') senderAddress.value = address
    else receiverAddress.value = address
    addressPickerVisible.value = false
  } catch (error) {
    toast(error.message || '地址详情加载失败')
  }
}

const addressTitle = (address, emptyText) => {
  if (!address) return emptyText
  return `${address.name || '未命名'} ${address.phone || ''}`.trim()
}

const addressDetail = (address, emptyText) => {
  if (!address) return emptyText
  return [address.province, address.city, address.district, address.address].filter(Boolean).join(' ') || emptyText
}

const changeTab = (key) => {
  activeTab.value = key
  if (key === 'large' && Number(goodsForm.weight || 0) < 30) goodsForm.weight = '30'
}

const handleDeliveryChange = (event) => {
  const index = Number(event.detail.value || 0)
  selectedDeliveryIndex.value = deliveryOptions.value[index]?.index || selectedDeliveryIndex.value
}

const changeNumber = (delta) => {
  goodsForm.number = Math.max(1, Number(goodsForm.number || 1) + delta)
}

const saveGoods = () => {
  if (!goodsForm.itemIndex) {
    toast('请选择物品类型')
    return
  }
  if (!Number.isFinite(Number(goodsForm.weight)) || Number(goodsForm.weight) <= 0) {
    toast('请输入有效重量')
    return
  }
  if (goodsForm.isBaoMoney === '1' && (!Number.isFinite(Number(goodsForm.baoMoney)) || Number(goodsForm.baoMoney) <= 0)) {
    toast('请输入保价金额')
    return
  }
  goodsForm.weight = String(normalizedWeight.value)
  goodsSaved.value = true
  pageMode.value = 'main'
  estimateFreight()
}

const canEstimate = () => activeTab.value === 'normal' && senderAddress.value?.id && receiverAddress.value?.id && goodsSaved.value

const estimateFreight = async () => {
  if (!canEstimate()) return
  estimating.value = true
  try {
    estimateInfo.value = await orderApi.estimate({
      sender_id: senderAddress.value.id,
      recipient_id: receiverAddress.value.id,
      businessType: selectedDeliveryIndex.value,
      weight: normalizedWeight.value,
      consignedTime: subDate.value,
    })
  } catch (error) {
    console.warn('estimate failed', error)
    estimateInfo.value = {}
    toast(error.message || '运费试算失败')
  } finally {
    estimating.value = false
  }
}

const validateCommon = () => {
  if (!senderAddress.value?.id) {
    toast('请选择寄件地址')
    return false
  }
  if (!receiverAddress.value?.id && activeTab.value !== 'batch') {
    toast('请选择收件地址')
    return false
  }
  if (!goodsSaved.value) {
    toast('请先保存物品信息')
    return false
  }
  return true
}

const createPayload = () => ({
  sender_id: String(senderAddress.value.id),
  recipient_id: String(receiverAddress.value.id),
  delivery_type: String(selectedDeliveryIndex.value),
  item_type: String(goodsForm.itemIndex),
  fragile_type: goodsForm.fragileType,
  weight: String(normalizedWeight.value),
  number: String(goodsForm.number || 1),
  is_bao_money: goodsForm.isBaoMoney,
  bao_money: goodsForm.isBaoMoney === '1' ? String(goodsForm.baoMoney || 0) : '0',
  pay_method: payMethod.value,
  sub_date: subDate.value,
  note: note.value || '',
})

const submitCurrentFlow = () => {
  if (submitting.value) return
  if (activeTab.value === 'normal') {
    submitNormalOrder()
    return
  }
  submitLocalDraft()
}

const submitNormalOrder = async () => {
  if (!validateCommon()) return
  submitting.value = true
  try {
    const data = await orderApi.create(createPayload())
    const orderId = data?.order_id || data?.id
    if (!orderId) {
      toast('订单已创建，但接口未返回订单ID')
      return
    }
    if (payMethod.value === '2') {
      toast('到付订单已提交')
      return
    }
    const payData = await orderApi.pay(orderId)
    const payParam = payData?.payParam
    if (!payParam) {
      toast('订单已创建，支付参数缺失')
      return
    }
    uni.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: () => {
        toast('支付成功')
        uni.switchTab({ url: '/pages/express/index' })
      },
      fail: () => toast('支付已取消或失败'),
    })
  } catch (error) {
    toast(error.message || '下单失败')
  } finally {
    submitting.value = false
  }
}

const submitLocalDraft = () => {
  if (!senderAddress.value?.id) {
    toast('请选择寄件地址')
    return
  }
  if (activeTab.value === 'batch' && !batchReceivers.value.length) {
    toast('请先添加批量收件人')
    return
  }
  if (activeTab.value !== 'batch' && !receiverAddress.value?.id) {
    toast('请选择收件地址')
    return
  }
  if (!goodsSaved.value) {
    toast('请先保存物品信息')
    return
  }
  if (activeTab.value === 'business' && !businessForm.company.trim()) {
    toast('请填写店铺或公司名称')
    return
  }
  const message = activeTab.value === 'batch'
    ? '批量下单接口未提供，已保留本地批量草稿'
    : `${currentTabLabel.value}接口未提供，已保留本地草稿`
  toast(message)
}

const parseBatchReceivers = () => {
  const lines = batchText.value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  if (!lines.length) {
    toast('请先粘贴收件人文本')
    return
  }
  batchReceivers.value = lines.map((line, index) => {
    const phone = line.match(/1[3-9]\d{9}/)?.[0] || ''
    const cleaned = line.replace(phone, '').trim()
    const parts = cleaned.split(/\s+/).filter(Boolean)
    return {
      name: parts[0] || `收件人${index + 1}`,
      phone,
      address: parts.slice(1).join(' '),
      raw: line,
    }
  })
}

const addReceiverFromCurrent = () => {
  if (!receiverAddress.value) {
    toast('请先选择当前收件人')
    return
  }
  batchReceivers.value = batchReceivers.value.concat({
    name: receiverAddress.value.name,
    phone: receiverAddress.value.phone,
    address: addressDetail(receiverAddress.value, ''),
  })
}

const handleBack = () => {
  if (pageMode.value === 'goods') {
    pageMode.value = 'main'
    return
  }
  const pages = getCurrentPages()
  if (pages.length > 1) uni.navigateBack()
  else uni.switchTab({ url: '/pages/index/index' })
}

watch([senderAddress, receiverAddress, selectedDeliveryIndex, scheduleDate, scheduleTime, () => goodsForm.weight], () => {
  estimateFreight()
})

onMounted(() => {
  initSchedule()
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const tab = current?.options?.tab
  if (tabs.some((item) => item.key === tab)) activeTab.value = tab
  loadConfig()
  loadAddressList()
})
</script>

<style>
page {
  background: #f4f6fa;
}

.send-page {
  min-height: 100vh;
  background: #f4f6fa;
  color: #111827;
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

.capsule-line {
  width: 1rpx;
  height: 28rpx;
  background: #e5e7eb;
}

.capsule-circle {
  width: 24rpx;
  height: 24rpx;
  border: 5rpx solid #111827;
  border-radius: 50%;
  box-sizing: border-box;
}

.tab-scroll {
  width: 100%;
  height: 84rpx;
  white-space: nowrap;
  background: #ffffff;
  border-top: 1rpx solid #f1f3f7;
}

.tab-item {
  height: 84rpx;
  padding: 0 30rpx;
  position: relative;
  display: inline-flex;
  align-items: center;
  color: #7b8494;
  font-size: 29rpx;
  font-weight: 600;
  box-sizing: border-box;
}

.tab-item.active {
  color: #2f7df6;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 34rpx;
  right: 34rpx;
  bottom: 0;
  height: 6rpx;
  border-radius: 6rpx;
  background: #2f7df6;
}

.content {
  height: calc(100vh - 172rpx - var(--status-bar-height));
  padding: 22rpx 24rpx 178rpx;
  box-sizing: border-box;
}

.api-missing-card,
.address-card,
.form-card,
.estimate-card,
.rules-card {
  margin-bottom: 22rpx;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.api-missing-card {
  padding: 22rpx 24rpx;
  border: 1rpx solid #fed7aa;
  background: #fff7ed;
}

.missing-title {
  color: #9a3412;
  font-size: 28rpx;
  font-weight: 700;
}

.missing-desc {
  display: block;
  margin-top: 10rpx;
  color: #c2410c;
  font-size: 24rpx;
  line-height: 34rpx;
}

.address-card {
  padding: 32rpx 24rpx;
}

.address-line {
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.step {
  width: 68rpx;
  min-height: 88rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.step-dot {
  width: 66rpx;
  height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 800;
}

.sender {
  background: #12b981;
}

.receiver {
  background: #438bff;
}

.step-wire {
  position: absolute;
  left: 33rpx;
  top: 72rpx;
  height: 70rpx;
  border-left: 2rpx dashed #c8ced8;
}

.address-copy {
  flex: 1;
  min-width: 0;
  padding-left: 22rpx;
}

.address-title {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 31rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-desc {
  display: block;
  margin-top: 9rpx;
  overflow: hidden;
  color: #8b95a1;
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-link {
  width: 112rpx;
  color: #2f7df6;
  font-size: 26rpx;
  text-align: right;
}

.address-divider {
  height: 1rpx;
  margin: 26rpx 0 26rpx 92rpx;
  background: #edf0f5;
}

.form-card,
.estimate-card,
.rules-card {
  padding: 0 24rpx;
}

.cell,
.field-row {
  min-height: 98rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #edf0f5;
}

.cell:last-child,
.field-row:last-child {
  border-bottom: none;
}

.head-cell {
  justify-content: space-between;
}

.cell-title-row {
  display: flex;
  align-items: center;
}

.cell-title,
.field-label {
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
}

.cell-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #8b95a1;
  font-size: 23rpx;
}

.required {
  height: 34rpx;
  margin-left: 12rpx;
  padding: 0 12rpx;
  border: 1rpx solid #ef4444;
  border-radius: 18rpx;
  color: #ef4444;
  font-size: 21rpx;
  line-height: 34rpx;
}

.picker-value {
  min-width: 180rpx;
  color: #5b6472;
  font-size: 26rpx;
  text-align: right;
}

.cell {
  justify-content: space-between;
}

.note-cell {
  align-items: center;
}

.note-input,
.field-input {
  flex: 1;
  min-width: 0;
  height: 68rpx;
  color: #4b5563;
  font-size: 26rpx;
  text-align: right;
}

.field-label {
  width: 154rpx;
  flex-shrink: 0;
}

.field-unit {
  margin-left: 8rpx;
  color: #8b95a1;
  font-size: 24rpx;
}

.size-input {
  width: 86rpx;
  height: 54rpx;
  margin-left: 10rpx;
  border-radius: 8rpx;
  background: #f5f7fb;
  color: #4b5563;
  font-size: 23rpx;
  text-align: center;
}

.segmented {
  display: flex;
  padding: 4rpx;
  border-radius: 10rpx;
  background: #eef2f7;
}

.pay-segmented {
  margin-left: auto;
}

.segmented-item {
  min-width: 92rpx;
  height: 52rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  color: #697386;
  font-size: 24rpx;
  box-sizing: border-box;
}

.segmented-item.active {
  background: #438bff;
  color: #ffffff;
  font-weight: 700;
}

.section-head {
  min-height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 29rpx;
  font-weight: 700;
}

.section-count,
.section-hint {
  color: #8b95a1;
  font-size: 23rpx;
  font-weight: 400;
}

.batch-textarea {
  width: 100%;
  height: 170rpx;
  padding: 18rpx;
  border-radius: 10rpx;
  background: #f5f7fb;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 34rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #a7afbc;
}

.inline-actions {
  margin: 20rpx 0 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 14rpx;
}

.outline-action,
.primary-action {
  height: 58rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.outline-action {
  border: 1rpx solid #cfd6e0;
  color: #5b6472;
}

.primary-action {
  background: #438bff;
  color: #ffffff;
}

.receiver-list {
  padding-bottom: 16rpx;
}

.receiver-item {
  margin-bottom: 12rpx;
  padding: 18rpx;
  border-radius: 10rpx;
  background: #f8fafc;
}

.receiver-name {
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.receiver-phone {
  margin-left: 16rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.receiver-address {
  display: block;
  margin-top: 8rpx;
  color: #8b95a1;
  font-size: 23rpx;
  line-height: 32rpx;
}

.hint-box {
  margin-bottom: 24rpx;
  padding: 18rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 36rpx;
}

.money-row,
.actual-row {
  min-height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5b6472;
  font-size: 25rpx;
}

.money {
  color: #ef4444;
  font-weight: 700;
}

.actual-row {
  min-height: 84rpx;
  border-top: 1rpx solid #edf0f5;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.actual-row text:last-child {
  color: #ef4444;
}

.rule-block {
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf0f5;
}

.rule-block:last-child {
  border-bottom: none;
}

.rule-title,
.rule-content {
  display: block;
}

.rule-title {
  color: #111827;
  font-size: 27rpx;
  font-weight: 700;
}

.rule-content {
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 36rpx;
}

.bottom-space {
  height: 80rpx;
}

.submit-bar,
.save-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  background: #ffffff;
  box-shadow: 0 -8rpx 26rpx rgba(15, 23, 42, 0.06);
  z-index: 9;
  box-sizing: border-box;
}

.submit-copy {
  flex: 1;
  min-width: 0;
}

.submit-price {
  display: flex;
  align-items: baseline;
  color: #111827;
  font-size: 25rpx;
}

.submit-money {
  margin-left: 8rpx;
  color: #ef4444;
  font-size: 36rpx;
  font-weight: 800;
}

.submit-tip {
  display: block;
  margin-top: 4rpx;
  color: #8b95a1;
  font-size: 22rpx;
}

.submit-button {
  width: 236rpx;
  height: 78rpx;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
}

.submit-button.disabled {
  background: #a7b9dd;
}

.goods-scroll {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 24rpx 24rpx 160rpx;
  box-sizing: border-box;
}

.goods-label {
  display: block;
  margin-bottom: 18rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.goods-type {
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #dce2ea;
  border-radius: 10rpx;
  background: #ffffff;
  color: #5b6472;
  font-size: 24rpx;
  box-sizing: border-box;
}

.goods-type.active {
  border-color: #438bff;
  background: #438bff;
  color: #ffffff;
  font-weight: 700;
}

.goods-form-card {
  margin-top: 22rpx;
}

.stepper {
  display: flex;
  align-items: center;
  border-radius: 8rpx;
  background: #eef2f7;
}

.stepper-btn,
.stepper-value {
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 26rpx;
}

.stepper-btn {
  width: 54rpx;
  font-weight: 800;
}

.stepper-value {
  width: 76rpx;
}

.goods-note {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 12rpx;
  background: #fff7ed;
}

.goods-note text {
  display: block;
  color: #9a3412;
  font-size: 23rpx;
  line-height: 34rpx;
}

.save-btn {
  flex: 1;
  height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
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

.address-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 78vh;
  padding: 26rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
}

.popup-head {
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 31rpx;
  font-weight: 800;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 46rpx;
  font-weight: 400;
}

.popup-empty {
  min-height: 260rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 27rpx;
  text-align: center;
}

.popup-empty-desc {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 23rpx;
  line-height: 34rpx;
}

.address-popup-list {
  max-height: 62vh;
  margin-top: 16rpx;
}

.address-option {
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf0f5;
}

.address-option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
}

.address-option-detail {
  display: block;
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 34rpx;
}
</style>
