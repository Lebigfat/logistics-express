<template>
  <view class="send-page">
    <AppHead :title="pageTitle">
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
      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <scroll-view scroll-y class="content">
        <template v-if="activeTab === 'normal'">
          <AddressCard />

          <view class="info-card">
            <view class="cell head-cell" @tap="pageMode = 'goods'">
              <view class="cell-left">
                <text class="cell-title">物品信息</text>
                <text v-if="!goodsSaved" class="required">必填</text>
                <text v-else class="goods-summary">{{ goodsSummary }}</text>
              </view>
              <UvIcon name="arrow-right" color="#1f2937" size="18"></UvIcon>
            </view>
            <view class="cell">
              <text class="cell-title">快递重量（kg）</text>
              <Stepper v-model:value="weight" />
            </view>
            <view class="cell" @tap="goCoupon">
              <text class="cell-title">优惠券</text>
              <view class="cell-right">
                <text>{{ selectedCoupon ? `${selectedCoupon.title} -¥${selectedCoupon.amount}` : '未使用' }}</text>
                <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
              </view>
            </view>
            <view class="cell last" @tap="showRemarkPopup = true">
              <text class="cell-title">备注</text>
              <view class="cell-right">
                <text>{{ remark || '选填' }}</text>
                <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
              </view>
            </view>
          </view>

          <CourierList :items="courierRows" v-model:selected="selectedCourier" />
        </template>

        <template v-else-if="activeTab === 'batch'">
          <view class="batch-address-card">
            <view class="batch-address-row">
              <view class="step-dot sender">寄</view>
              <text class="batch-main-text">{{ senderAddress ? `${senderAddress.name} ${senderAddress.phone}` : '新建寄件人' }}</text>
              <text class="book-link" @tap="openAddressBook('sender')">地址簿</text>
            </view>
          </view>

          <view class="batch-info-card">
            <text class="batch-section-title">收件人信息</text>
            <view class="batch-tool-row">
              <view class="batch-tool" @tap="openAddressBook('receiver')">
                <UvIcon name="map" color="#1f2937" size="18"></UvIcon>
                <text>地址簿选择</text>
              </view>
              <view class="batch-tool" @tap="showExcelPopup = true">
                <UvIcon name="file-text" color="#1f2937" size="18"></UvIcon>
                <text>Excel导入</text>
              </view>
              <view class="batch-tool" @tap="showRecognizePopup = true">
                <UvIcon name="scan" color="#1f2937" size="18"></UvIcon>
                <text>批量识别</text>
              </view>
            </view>
            <view v-if="batchReceivers.length" class="receiver-count">已添加 {{ batchReceivers.length }} 个收件人</view>
          </view>

          <view class="batch-courier-card" @tap="showCourierPopup = true">
            <text class="cell-title">快递公司</text>
            <view class="cell-right">
              <text>{{ selectedBatchCourier ? selectedBatchCourier.name : '请选择' }}</text>
              <UvIcon name="arrow-right" color="#1f2937" size="18"></UvIcon>
            </view>
          </view>
        </template>

        <view v-else class="empty-panel">
          <text>{{ currentTabLabel }}</text>
          <text class="empty-desc">当前服务可在普通寄件流程下单</text>
        </view>

        <view class="bottom-space"></view>
      </scroll-view>

      <SubmitBar :price="displayPrice" />
    </template>

    <template v-else>
      <scroll-view scroll-y class="goods-scroll">
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
            <view>
              <view class="goods-row-title">
                <text>报价金额（元）</text>
                <text class="help-icon">?</text>
              </view>
              <text class="goods-tip">保价丢件可赔付</text>
            </view>
            <input v-model="goodsForm.insuredAmount" class="goods-input" type="number" placeholder="请输入金额" />
          </view>
          <view class="goods-row">
            <text class="goods-row-title">快递重量（kg）</text>
            <Stepper v-model:value="goodsForm.weight" />
          </view>
          <view class="goods-row">
            <text class="goods-row-title">体积重量</text>
            <view class="volume-inputs">
              <input v-model="goodsForm.length" type="number" placeholder="长(cm)" />
              <input v-model="goodsForm.width" type="number" placeholder="宽(cm)" />
              <input v-model="goodsForm.height" type="number" placeholder="高(cm)" />
            </view>
          </view>
          <view class="goods-row">
            <text class="goods-row-title">件数</text>
            <Stepper v-model:value="goodsForm.count" />
          </view>
        </view>

        <view class="goods-note">
          <text class="goods-note-title">重要提示：</text>
          <text>1、根据快递行业惯例，体积重量大于称重重量时，将按体积重量计算运费。</text>
          <text class="blue-text">2、请如实填写重量，快递员上门后计算重量大于下单重量的，可回到平台补缴运费。</text>
          <text>3、计费重量不足1kg的包裹按1kg计算，超出部分按进位计算。</text>
          <text>4、托寄物品应遵守国家相关规定。</text>
        </view>
      </scroll-view>

      <view class="save-bar">
        <view class="save-btn" @tap="saveGoods">保存</view>
      </view>
    </template>

    <view v-if="showCourierPopup" class="popup-mask" @tap.self="showCourierPopup = false">
      <view class="courier-popup">
        <view class="popup-head">
          <view class="popup-side"></view>
          <text class="popup-title">选择快递公司</text>
          <view class="popup-close" @tap="showCourierPopup = false">
            <UvIcon name="close" color="#9ca3af" size="20"></UvIcon>
          </view>
        </view>
        <CourierList :items="courierRows" v-model:selected="pendingBatchCourier" compact />
        <view class="popup-confirm" @tap="confirmBatchCourier">确定</view>
      </view>
    </view>

    <view v-if="showExcelPopup" class="popup-mask" @tap.self="showExcelPopup = false">
      <view class="sheet-popup">
        <text class="sheet-title">Excel导入</text>
        <text class="sheet-desc">请按模板整理收件人姓名、电话、省市区和详细地址，导入后可继续编辑。</text>
        <view class="sheet-card">
          <text>收件人导入模板.xlsx</text>
          <view class="sheet-btn" @tap="importExcel">模拟导入</view>
        </view>
      </view>
    </view>

    <view v-if="showRecognizePopup" class="popup-mask" @tap.self="showRecognizePopup = false">
      <view class="sheet-popup">
        <text class="sheet-title">批量识别</text>
        <textarea v-model="recognizeText" class="recognize-area" placeholder="粘贴多个收件人地址，每行一个：姓名 手机号 省市区 详细地址" />
        <view class="popup-confirm" @tap="confirmRecognize">确定</view>
      </view>
    </view>

    <view v-if="showRemarkPopup" class="popup-mask" @tap.self="showRemarkPopup = false">
      <view class="sheet-popup">
        <text class="sheet-title">备注</text>
        <textarea v-model="remarkDraft" class="recognize-area" placeholder="请输入给快递员的备注" />
        <view class="popup-confirm" @tap="saveRemark">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { orderApi, userApi } from '@/services/api'

const tabs = [
  { key: 'normal', label: '寄快递' },
  { key: 'batch', label: '批量寄件' },
  { key: 'large', label: '寄大件' },
  { key: 'warehouse', label: '寄得物仓' },
  { key: 'business', label: '商家寄件' },
]

const pageMode = ref('main')
const activeTab = ref('normal')
const weight = ref(2)
const senderAddress = ref(null)
const receiverAddress = ref(null)
const goodsSaved = ref(false)
const selectedCoupon = ref(null)
const selectedCourier = ref('圆通')
const selectedBatchCourier = ref(null)
const pendingBatchCourier = ref('圆通')
const freightInfo = ref(null)
const estimating = ref(false)
const deliveryOptions = ref([])
const goodsOptions = ref([])
const showCourierPopup = ref(false)
const showExcelPopup = ref(false)
const showRecognizePopup = ref(false)
const showRemarkPopup = ref(false)
const batchReceivers = ref([])
const recognizeText = ref('')
const remark = ref('')
const remarkDraft = ref('')
let eventChannel = null

const fallbackGoodsTypes = ['食品饮品', '潮玩', '美妆', '数码电器', '家具', '零食', '酒水', '文件', '日用品', '图书', '箱包', '其他']
const goodsTypes = computed(() => (goodsOptions.value.length ? goodsOptions.value.map((item) => item.value) : fallbackGoodsTypes))
const goodsForm = ref({
  type: '食品饮品',
  insuredAmount: '',
  weight: 2,
  length: '',
  width: '',
  height: '',
  count: 1,
})

const couriers = [
  { name: '圆通', logo: 'YTO', color: '#5d2d82', badge: '推荐', price: 5, tag: '极力推荐，取件较好，上门及时' },
  { name: '韵达', logo: 'Y', color: '#ffcf23', textColor: '#111827', price: 5, tag: '官方渠道，取件较好，效率高' },
  { name: '中通快递', logo: 'ZTO', color: '#2fa7ff', price: 5, tag: '全国始发，价格优惠' },
  { name: '申通快递', logo: 'sto', color: '#737373', price: 5, tag: '平台特惠补贴' },
  { name: '菜鸟快递', logo: '菜', color: '#0398ff', price: 8, tag: '菜鸟直营，2小时内上门' },
  { name: '极兔快递', logo: 'J&T', color: '#ef2b2d', price: 5, tag: '适合9公斤内，超9公斤差价偏高' },
  { name: '京东快递', logo: 'JD', color: '#eb3b32', price: 7, tag: '京东直营，当天揽收' },
]

const courierRows = computed(() => {
  if (!deliveryOptions.value.length) return couriers
  return deliveryOptions.value.map((item, index) => ({
    name: item.value,
    logo: item.value.slice(0, 3).toUpperCase(),
    color: ['#5d2d82', '#ffcf23', '#2fa7ff', '#737373', '#0398ff', '#ef2b2d'][index % 6],
    textColor: index % 6 === 1 ? '#111827' : '#ffffff',
    price: freightInfo.value?.yg_price || 5,
    tag: index === 0 ? '平台推荐，价格以实时试算为准' : '可选快递类型',
    apiIndex: item.index,
  }))
})

const pageTitle = computed(() => (pageMode.value === 'goods' ? '物品信息' : '寄快递'))
const currentTabLabel = computed(() => tabs.find((item) => item.key === activeTab.value)?.label || '')
const goodsSummary = computed(() => `${goodsForm.value.type}，${goodsForm.value.weight}kg，${goodsForm.value.count}件`)
const displayPrice = computed(() => {
  if (activeTab.value === 'batch') return 0
  if (!freightInfo.value) return 3980
  return Number(freightInfo.value.yg_price || 0)
})
const actualPriceText = computed(() => {
  if (!freightInfo.value) return ''
  const amount = Number(freightInfo.value.yg_price || 0) - Number(freightInfo.value.yh_price || 0)
  return `预计实付 ¥${Math.max(amount, 0)}`
})

const Stepper = defineComponent({
  props: { value: { type: Number, required: true } },
  emits: ['update:value'],
  setup(props, { emit }) {
    const change = (delta) => emit('update:value', Math.max(1, Number(props.value || 1) + delta))
    return () => h('view', { class: 'stepper' }, [
      h('text', { class: 'stepper-btn', onClick: () => change(-1) }, '-'),
      h('text', { class: 'stepper-value' }, String(props.value)),
      h('text', { class: 'stepper-btn', onClick: () => change(1) }, '+'),
    ])
  },
})

const AddressCard = defineComponent({
  setup() {
    const row = (type, label, address, desc) => h('view', { class: 'address-line' }, [
      h('view', { class: 'step' }, [
        h('view', { class: ['step-dot', type === 'sender' ? 'sender' : 'receiver'] }, label),
        type === 'sender' ? h('view', { class: 'step-wire' }) : null,
      ]),
      h('view', { class: 'address-copy', onClick: () => openAddressBook(type) }, [
        h('text', { class: 'address-title' }, address.value ? `${address.value.name} ${address.value.phone}` : `${label === '寄' ? '寄件人' : '收件人'}信息`),
        h('text', { class: 'address-desc' }, address.value ? `${address.value.region}${address.value.detail}` : desc),
      ]),
      h('text', { class: 'book-link', onClick: () => openAddressBook(type) }, '地址簿'),
    ])
    return () => h('view', { class: 'address-card' }, [
      row('sender', '寄', senderAddress, '请输入真实姓名'),
      h('view', { class: 'address-divider' }),
      row('receiver', '收', receiverAddress, '支持地址粘贴、图片识别'),
    ])
  },
})

const CourierList = defineComponent({
  props: {
    items: { type: Array, required: true },
    selected: { type: String, required: true },
    compact: { type: Boolean, default: false },
  },
  emits: ['update:selected'],
  setup(props, { emit }) {
    return () => h('view', { class: props.compact ? 'courier-card compact' : 'courier-card' }, props.items.map((item) => (
      h('view', { class: 'courier-row', onClick: () => emit('update:selected', item.name) }, [
        h('view', { class: 'logo', style: { backgroundColor: item.color, color: item.textColor || '#ffffff' } }, item.logo),
        h('view', { class: 'courier-main' }, [
          h('view', { class: 'courier-name-row' }, [
            h('text', { class: 'courier-name' }, item.name),
            item.badge ? h('text', { class: 'badge' }, item.badge) : null,
          ]),
          h('view', { class: 'price-row' }, [
            h('text', null, '预估价格：'),
            h('text', { class: 'price' }, `${item.price}元起`),
          ]),
          h('text', { class: 'tag' }, item.tag),
        ]),
        h('view', { class: ['radio', props.selected === item.name ? 'checked' : ''] }, props.selected === item.name ? '✓' : ''),
      ])
    )))
  },
})

const SubmitBar = defineComponent({
  props: { price: { type: Number, required: true } },
  setup(props) {
    return () => h('view', { class: 'submit-bar' }, [
      h('view', { class: 'notice' }, '注:所有费用都在平台完成，无需向快递员额外付费'),
      h('view', { class: 'submit-row' }, [
        h('view', { class: 'fee' }, [
          h('view', { class: 'fee-line' }, [h('text', null, '运费：'), h('text', { class: 'fee-price' }, `￥${props.price}`)]),
          actualPriceText.value ? h('view', { class: 'actual-price' }, actualPriceText.value) : null,
          h('view', { class: 'agree' }, [h('view', { class: 'agree-dot' }, '✓'), h('text', null, '我已阅读并同意'), h('text', { class: 'protocol' }, '《寄件服务协议》')]),
        ]),
        h('view', { class: 'submit-button', onClick: submitOrder }, '立即下单'),
      ]),
    ])
  },
})

watch(showRemarkPopup, (show) => {
  if (show) remarkDraft.value = remark.value
})

watch([senderAddress, receiverAddress, weight, activeTab, selectedCourier], () => {
  estimateFreight()
})

const openAddressBook = (type) => {
  uni.navigateTo({
    url: `/pages/address/index?type=${type}`,
    events: {
      selectAddress(payload) {
        if (payload.type === 'receiver') receiverAddress.value = payload.address
        else senderAddress.value = payload.address
      },
    },
  })
}

const goCoupon = () => {
  uni.navigateTo({
    url: '/pages/coupon/index',
    events: {
      selectCoupon(coupon) {
        selectedCoupon.value = coupon
      },
    },
  })
}

const saveGoods = () => {
  goodsSaved.value = true
  weight.value = goodsForm.value.weight
  pageMode.value = 'main'
  estimateFreight()
}

const confirmBatchCourier = () => {
  selectedBatchCourier.value = courierRows.value.find((item) => item.name === pendingBatchCourier.value)
  showCourierPopup.value = false
}

const getDeliveryIndex = () => {
  const selected = courierRows.value.find((item) => item.name === selectedCourier.value) || courierRows.value[0]
  return selected?.apiIndex || deliveryOptions.value[0]?.index || 1
}

const getGoodsIndex = () => {
  const selected = goodsOptions.value.find((item) => item.value === goodsForm.value.type)
  return selected?.index || Math.max(fallbackGoodsTypes.indexOf(goodsForm.value.type) + 1, 1)
}

const getSubDate = () => {
  const date = new Date()
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 16:59:59`
}

const estimateFreight = async () => {
  if (activeTab.value !== 'normal' || !senderAddress.value?.id || !receiverAddress.value?.id) return
  estimating.value = true
  try {
    freightInfo.value = await orderApi.estimate({
      sender_id: senderAddress.value.id,
      recipient_id: receiverAddress.value.id,
      businessType: getDeliveryIndex(),
      weight: weight.value,
      consignedTime: getSubDate(),
    })
  } catch (error) {
    console.warn('estimate freight failed', error)
  } finally {
    estimating.value = false
  }
}

const loadConfig = async () => {
  try {
    const [delivery, goods] = await Promise.all([
      userApi.getConfig('deliveryType'),
      userApi.getConfig('itemInfo'),
    ])
    deliveryOptions.value = Array.isArray(delivery) ? delivery : []
    goodsOptions.value = Array.isArray(goods) ? goods : []
    if (deliveryOptions.value[0]) {
      selectedCourier.value = deliveryOptions.value[0].value
      pendingBatchCourier.value = deliveryOptions.value[0].value
    }
    if (goodsOptions.value[0]) goodsForm.value.type = goodsOptions.value[0].value
  } catch (error) {
    console.warn('load order config failed', error)
  }
}

const importExcel = () => {
  batchReceivers.value = [
    { name: '王五', phone: '13800001111' },
    { name: '赵六', phone: '13900002222' },
  ]
  showExcelPopup.value = false
}

const confirmRecognize = () => {
  const lines = recognizeText.value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  batchReceivers.value = lines.map((line, index) => ({ name: line.split(/\s+/)[0] || `收件人${index + 1}`, phone: line.match(/1[3-9]\d{9}/)?.[0] || '' }))
  showRecognizePopup.value = false
}

const saveRemark = () => {
  remark.value = remarkDraft.value
  showRemarkPopup.value = false
}

const submitOrder = async () => {
  if (activeTab.value !== 'normal') {
    uni.showToast({ title: '批量寄件接口未提供，暂未接入', icon: 'none' })
    return
  }
  if (!senderAddress.value?.id || !receiverAddress.value?.id) {
    uni.showToast({ title: '请选择寄件和收件地址', icon: 'none' })
    return
  }
  if (!goodsSaved.value) {
    uni.showToast({ title: '请填写物品信息', icon: 'none' })
    return
  }
  try {
    const payload = {
      sender_id: senderAddress.value.id,
      recipient_id: receiverAddress.value.id,
      delivery_type: getDeliveryIndex(),
      item_type: getGoodsIndex(),
      fragile_type: '2',
      weight: String(weight.value),
      number: String(goodsForm.value.count || 1),
      is_bao_money: goodsForm.value.insuredAmount ? '1' : '2',
      bao_money: String(goodsForm.value.insuredAmount || 0),
      pay_method: '1',
      sub_date: getSubDate(),
      note: remark.value || '',
    }
    const data = await orderApi.create(payload)
    uni.showToast({ title: '下单成功', icon: 'none' })
    if (data?.order_id) {
      try {
        const payData = await orderApi.pay(data.order_id)
        const payParam = payData?.payParam
        if (payParam) {
          uni.requestPayment({
            timeStamp: payParam.timeStamp,
            nonceStr: payParam.nonceStr,
            package: payParam.package,
            signType: payParam.signType,
            paySign: payParam.paySign,
            success: () => {
              uni.switchTab({ url: '/pages/express/index' })
            },
          })
        }
      } catch (payError) {
        console.warn('pay order failed', payError)
      }
    }
  } catch (error) {
    uni.showToast({ title: error.message || '下单失败', icon: 'none' })
  }
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

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  eventChannel = current?.getOpenerEventChannel?.()
  const tab = current?.options?.tab
  if (tab === 'batch' || tab === 'large' || tab === 'business') activeTab.value = tab
  loadConfig()
  if (eventChannel) {
    eventChannel.on?.('selectAddress', (payload) => {
      if (payload.type === 'receiver') receiverAddress.value = payload.address
      else senderAddress.value = payload.address
    })
  }
})
</script>

<style>
page {
  background: #f3f4f6;
}

.send-page {
  min-height: 100vh;
  background: #f3f4f6;
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

.tab-bar {
  height: 72rpx;
  padding: 0 30rpx;
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
  color: #9a9a9a;
  font-size: 28rpx;
  white-space: nowrap;
}

.tab-item.active {
  color: #438bff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 0;
  height: 5rpx;
  border-radius: 5rpx;
  background: #438bff;
}

.content {
  height: calc(100vh - 160rpx - var(--status-bar-height));
  box-sizing: border-box;
}

.address-card,
.info-card,
.courier-card,
.batch-address-card,
.batch-info-card,
.batch-courier-card,
.empty-panel {
  margin: 32rpx 30rpx 0;
  border-radius: 14rpx;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
}

.address-card {
  padding: 36rpx 24rpx;
}

.address-line {
  min-height: 86rpx;
  display: flex;
  align-items: center;
}

.step {
  width: 64rpx;
  min-height: 86rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.step-dot {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.sender {
  background: #11c9a6;
}

.receiver {
  background: #4b8dff;
}

.step-wire {
  position: absolute;
  left: 31rpx;
  top: 76rpx;
  height: 70rpx;
  border-left: 2rpx dashed #c8ccd4;
}

.address-copy {
  flex: 1;
  min-width: 0;
  padding-left: 26rpx;
}

.address-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}

.address-desc {
  display: block;
  margin-top: 10rpx;
  overflow: hidden;
  color: #9a9a9a;
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-link {
  width: 116rpx;
  border-left: 1rpx solid #e5e7eb;
  color: #111827;
  font-size: 31rpx;
  text-align: right;
}

.address-divider {
  height: 1rpx;
  margin: 28rpx 0 28rpx 88rpx;
  background: #edf0f5;
}

.cell {
  height: 108rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
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
  font-size: 31rpx;
  font-weight: 500;
}

.required {
  height: 36rpx;
  margin-left: 14rpx;
  padding: 0 12rpx;
  border: 1rpx solid #ff5b34;
  border-radius: 20rpx;
  color: #ff5b34;
  font-size: 23rpx;
  line-height: 36rpx;
}

.goods-summary,
.cell-right {
  color: #9a9a9a;
  font-size: 28rpx;
}

.goods-summary {
  margin-left: 12rpx;
}

.stepper {
  height: 44rpx;
  display: flex;
  align-items: center;
  background: #f5f7fb;
}

.stepper-btn,
.stepper-value {
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 28rpx;
}

.stepper-btn {
  width: 44rpx;
  background: #f1f3f7;
  font-weight: 700;
}

.stepper-value {
  width: 88rpx;
}

.courier-card {
  padding: 0 24rpx;
}

.courier-card.compact {
  margin: 16rpx 0 0;
  max-height: 800rpx;
  overflow: auto;
}

.courier-row {
  min-height: 176rpx;
  padding: 30rpx 0 24rpx;
  display: flex;
  align-items: flex-start;
  border-bottom: 1rpx solid #edf0f5;
  box-sizing: border-box;
}

.courier-row:last-child {
  border-bottom: none;
}

.logo {
  width: 72rpx;
  height: 72rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 20rpx;
  font-weight: 800;
}

.courier-main {
  flex: 1;
  min-width: 0;
}

.courier-name-row {
  display: flex;
  align-items: center;
}

.courier-name {
  font-size: 31rpx;
  font-weight: 700;
}

.badge {
  height: 36rpx;
  margin-left: 12rpx;
  padding: 0 14rpx;
  border-radius: 6rpx;
  background: #5c91ff;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 36rpx;
}

.price-row {
  margin-top: 10rpx;
  color: #9a9a9a;
  font-size: 28rpx;
}

.price {
  color: #ff4d1f;
}

.tag {
  display: inline-flex;
  height: 38rpx;
  margin-top: 12rpx;
  padding: 0 12rpx;
  border-radius: 7rpx;
  background: #ff5a00;
  color: #ffffff;
  font-size: 23rpx;
  line-height: 38rpx;
  max-width: 430rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.radio {
  width: 40rpx;
  height: 40rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #a7a7a7;
  border-radius: 50%;
  color: #ffffff;
  font-size: 24rpx;
  box-sizing: border-box;
}

.radio.checked {
  border-color: #4b8dff;
  background: #4b8dff;
}

.batch-address-card {
  padding: 32rpx 24rpx;
}

.batch-address-row {
  display: flex;
  align-items: center;
}

.batch-main-text {
  flex: 1;
  padding-left: 18rpx;
  font-size: 32rpx;
}

.batch-info-card {
  padding: 28rpx 24rpx 30rpx;
}

.batch-section-title {
  display: block;
  font-size: 31rpx;
}

.batch-tool-row {
  margin-top: 30rpx;
  padding-top: 24rpx;
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid #edf0f5;
}

.batch-tool {
  display: flex;
  align-items: center;
  color: #111827;
  font-size: 29rpx;
}

.batch-tool text {
  margin-left: 8rpx;
}

.receiver-count {
  margin-top: 24rpx;
  color: #438bff;
  font-size: 25rpx;
}

.batch-courier-card {
  height: 108rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-panel {
  height: 300rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 30rpx;
}

.empty-desc {
  margin-top: 16rpx;
  color: #a1a1aa;
  font-size: 24rpx;
}

.bottom-space {
  height: 188rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 30rpx calc(10rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  z-index: 9;
  box-sizing: border-box;
}

.notice {
  height: 48rpx;
  margin-top: 8rpx;
  border-radius: 7rpx;
  background: #ffe9e1;
  color: #ff4d1f;
  font-size: 27rpx;
  line-height: 48rpx;
  text-align: center;
}

.submit-row {
  height: 100rpx;
  display: flex;
  align-items: center;
}

.fee {
  flex: 1;
}

.fee-line {
  display: flex;
  align-items: baseline;
  font-size: 31rpx;
}

.fee-price {
  color: #ff6a00;
  font-size: 36rpx;
}

.agree {
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  color: #9a9a9a;
  font-size: 23rpx;
}

.agree-dot {
  width: 30rpx;
  height: 30rpx;
  margin-right: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #438bff;
  color: #ffffff;
}

.protocol {
  color: #438bff;
}

.submit-button {
  width: 220rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #4b8dff;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.goods-scroll {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 26rpx 22rpx 150rpx;
  box-sizing: border-box;
}

.goods-label {
  display: block;
  margin-bottom: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.goods-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.goods-type {
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e5e7eb;
  border-radius: 8rpx;
  background: #ffffff;
  color: #9ca3af;
  font-size: 23rpx;
  box-sizing: border-box;
}

.goods-type.active {
  border-color: #4d8df7;
  background: #4d8df7;
  color: #ffffff;
}

.goods-card,
.goods-note {
  margin-top: 22rpx;
  border-radius: 10rpx;
  background: #ffffff;
}

.goods-card {
  padding: 0 22rpx;
}

.goods-row {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
}

.goods-row:last-child {
  border-bottom: none;
}

.goods-price-row {
  min-height: 108rpx;
}

.goods-row-title {
  display: flex;
  align-items: center;
  font-size: 27rpx;
  font-weight: 700;
}

.help-icon {
  width: 26rpx;
  height: 26rpx;
  margin-left: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #cfd6e0;
  border-radius: 50%;
  color: #9ca3af;
  font-size: 18rpx;
}

.goods-tip {
  display: block;
  margin-top: 8rpx;
  color: #ff5a36;
  font-size: 20rpx;
}

.goods-input {
  width: 180rpx;
  height: 52rpx;
  padding: 0 12rpx;
  background: #f5f7fb;
  color: #4b5563;
  font-size: 24rpx;
  text-align: right;
  box-sizing: border-box;
}

.volume-inputs {
  display: flex;
  align-items: center;
}

.volume-inputs input {
  width: 98rpx;
  height: 46rpx;
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
  font-size: 23rpx;
  line-height: 36rpx;
}

.goods-note .goods-note-title {
  margin-bottom: 8rpx;
  color: #4b5563;
  font-weight: 700;
}

.blue-text {
  color: #498dff !important;
}

.save-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 38rpx calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  z-index: 9;
  box-sizing: border-box;
}

.save-btn,
.popup-confirm {
  height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: #4d8df7;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.courier-popup,
.sheet-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 42rpx calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  box-sizing: border-box;
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

.popup-title,
.sheet-title {
  flex: 1;
  color: #111827;
  font-size: 31rpx;
  font-weight: 700;
  text-align: center;
}

.sheet-title {
  display: block;
  text-align: left;
}

.sheet-desc {
  display: block;
  margin-top: 18rpx;
  color: #6b7280;
  font-size: 25rpx;
  line-height: 36rpx;
}

.sheet-card {
  height: 112rpx;
  margin-top: 28rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12rpx;
  background: #f5f7fb;
  font-size: 27rpx;
}

.sheet-btn {
  width: 150rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  background: #4b8dff;
  color: #ffffff;
  font-size: 24rpx;
}

.recognize-area {
  width: 100%;
  height: 220rpx;
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f5f7fb;
  color: #333333;
  font-size: 26rpx;
  box-sizing: border-box;
}

.sheet-popup .popup-confirm {
  margin-top: 28rpx;
}
</style>
