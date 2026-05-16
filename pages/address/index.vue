<template>
  <view class="address-root">
    <AppHead :title="pageTitle">
      <template #left>
        <view class="head-back" @tap="handleBack">
          <UvIcon name="arrow-left" color="#1f2937" size="21"></UvIcon>
        </view>
      </template>
    </AppHead>

    <template v-if="pageMode === 'list'">
      <view class="address-page">
        <view class="address-search">
          <UvIcon name="search" color="#9ca3af" size="17"></UvIcon>
          <text>请输入姓名/手机号/公司名称</text>
        </view>

        <view class="wechat-address-row">
          <view class="wechat-icon">
            <UvIcon name="car" color="#ffffff" size="14"></UvIcon>
          </view>
          <text>一键获取微信收货地址</text>
          <UvIcon name="arrow-right" color="#9ca3af" size="15"></UvIcon>
        </view>

        <view v-if="addressList.length" class="address-list-card">
          <view v-for="item in addressList" :key="item.id" class="address-list-item" @tap="selectAddress(item)">
            <view class="address-list-main">
              <view class="address-user-row">
                <text class="address-user">{{ item.name }}</text>
                <text class="address-phone">{{ item.phone }}</text>
              </view>
              <text class="address-detail">{{ item.region }}</text>
              <text class="address-detail">{{ item.detail }}</text>
            </view>
            <view class="address-card-footer">
              <view class="default-address">
                <view class="default-dot" :class="{ active: item.default }"></view>
                <text>默认寄件地址</text>
              </view>
              <view class="address-actions">
                <text @tap.stop="editAddress(item)">修改</text>
                <text @tap.stop>删除</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="address-empty">
          <text>您还没有填写相关的地址信息</text>
          <view class="address-empty-btn" @tap="startAddAddress">添加地址</view>
        </view>
      </view>

      <view class="address-bottom-bar">
        <view class="address-manage-btn">管理</view>
        <view class="address-add-btn" @tap="startAddAddress">添加地址</view>
      </view>
    </template>

    <template v-else>
      <scroll-view scroll-y class="address-form-scroll">
        <view class="parse-card">
          <view class="parse-example">示例:姓名，187****9989，上海市静安区XXX</view>
          <view class="parse-box">
            <textarea
              v-model="parseText"
              class="parse-textarea"
              placeholder="请粘贴或者输入文本,点击“识别”收货人姓名、手机号、地址"
              placeholder-class="parse-placeholder"
              auto-height
            />
            <view class="parse-actions">
              <view class="parse-clear" @tap="clearParseText">清空</view>
              <view class="parse-button" @tap="recognizeAddress">识别</view>
            </view>
          </view>
        </view>

        <view class="form-card">
          <view class="form-row">
            <text class="form-label">联系人</text>
            <input v-model="addressForm.name" class="form-input" placeholder="请输入联系人" placeholder-class="form-placeholder" />
          </view>
          <view class="form-row">
            <text class="form-label">联系电话</text>
            <input v-model="addressForm.phone" class="form-input" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
          </view>
          <view class="form-row" @tap="showRegionPicker = true">
            <text class="form-label">所在地区</text>
            <text class="form-value">{{ selectedRegionText }}</text>
            <UvIcon name="map-fill" color="#4d8df7" size="19"></UvIcon>
          </view>
          <view class="form-row">
            <text class="form-label">详细地址</text>
            <input v-model="addressForm.detail" class="form-input" placeholder="请输入详细地址" placeholder-class="form-placeholder" />
          </view>
        </view>

        <view class="default-card">
          <text>设置为默认地址</text>
          <view class="switch" :class="{ active: defaultAddress }" @tap="defaultAddress = !defaultAddress">
            <view></view>
          </view>
        </view>
      </scroll-view>

      <view class="save-address-bar">
        <view class="save-address-btn" @tap="saveAddress">保存</view>
      </view>
    </template>

    <u-picker
      :show="showRegionPicker"
      :columns="regionColumns"
      :default-index="regionPickerIndex"
      title="选择所在地区"
      key-name="label"
      confirm-color="#4d8df7"
      round="24rpx"
      @change="handleRegionChange"
      @cancel="showRegionPicker = false"
      @close="showRegionPicker = false"
      @confirm="confirmRegion"
    ></u-picker>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHead from '../../components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const pageMode = ref('list')
const addressType = ref('')
const parseText = ref('')
const editingAddressId = ref(null)
const defaultAddress = ref(true)
const showRegionPicker = ref(false)
const selectedRegion = ref(['四川省', '成都市', '高新区'])
const regionPickerIndex = ref([0, 0, 0])
let eventChannel = null

const addressForm = ref({
  name: '张三',
  phone: '17743258541',
  detail: '天府大道智都中1期2号楼',
})

const addressList = ref([
  {
    id: 1,
    name: '何其为',
    phone: '17712345678',
    region: '北京市北京昌平区沙河镇站前路',
    detail: '木屑厂宿舍',
    default: true,
  },
  {
    id: 2,
    name: '何为',
    phone: '15812347856',
    region: '四川省成都市双流区新通大道龙腾',
    detail: '苑宿舍',
    default: false,
  },
])

const regionTree = [
  {
    label: '四川省',
    children: [
      { label: '成都市', children: [{ label: '高新区' }, { label: '武侯区' }, { label: '双流区' }] },
      { label: '绵阳市', children: [{ label: '涪城区' }, { label: '游仙区' }] },
    ],
  },
  {
    label: '北京市',
    children: [
      { label: '北京市', children: [{ label: '昌平区' }, { label: '朝阳区' }, { label: '海淀区' }] },
    ],
  },
  {
    label: '上海市',
    children: [
      { label: '上海市', children: [{ label: '静安区' }, { label: '浦东新区' }, { label: '闵行区' }] },
    ],
  },
  {
    label: '广东省',
    children: [
      { label: '广州市', children: [{ label: '天河区' }, { label: '番禺区' }] },
      { label: '深圳市', children: [{ label: '南山区' }, { label: '福田区' }] },
    ],
  },
]

const getCities = (provinceIndex) => regionTree[provinceIndex]?.children || []
const getAreas = (provinceIndex, cityIndex) => getCities(provinceIndex)[cityIndex]?.children || []
const regionColumns = ref([regionTree, getCities(0), getAreas(0, 0)])
const selectedRegionText = computed(() => selectedRegion.value.join(' '))
const pageTitle = computed(() => {
  if (pageMode.value === 'form') {
    return editingAddressId.value ? '修改地址' : '添加地址'
  }

  return '地址簿'
})

const updateRegionColumns = (provinceIndex, cityIndex) => {
  regionColumns.value = [regionTree, getCities(provinceIndex), getAreas(provinceIndex, cityIndex)]
}

const handleRegionChange = ({ indexs, columnIndex }) => {
  const provinceIndex = indexs[0] || 0
  const cityIndex = columnIndex === 0 ? 0 : indexs[1] || 0
  const areaIndex = columnIndex === 0 || columnIndex === 1 ? 0 : indexs[2] || 0

  regionPickerIndex.value = [provinceIndex, cityIndex, areaIndex]
  updateRegionColumns(provinceIndex, cityIndex)
}

const confirmRegion = ({ value, indexs }) => {
  selectedRegion.value = value.map((item) => item.label)
  regionPickerIndex.value = indexs
  showRegionPicker.value = false
}

const setRegionByLabels = (labels) => {
  const provinceIndex = Math.max(regionTree.findIndex((item) => item.label === labels[0]), 0)
  const cities = getCities(provinceIndex)
  const cityIndex = Math.max(cities.findIndex((item) => item.label === labels[1]), 0)
  const areas = getAreas(provinceIndex, cityIndex)
  const areaIndex = Math.max(areas.findIndex((item) => item.label === labels[2]), 0)
  const province = regionTree[provinceIndex]
  const city = cities[cityIndex]
  const area = areas[areaIndex]

  selectedRegion.value = [province.label, city.label, area.label]
  regionPickerIndex.value = [provinceIndex, cityIndex, areaIndex]
  updateRegionColumns(provinceIndex, cityIndex)
}

const findRegionByText = (text) => {
  for (let provinceIndex = 0; provinceIndex < regionTree.length; provinceIndex += 1) {
    const province = regionTree[provinceIndex]
    for (let cityIndex = 0; cityIndex < province.children.length; cityIndex += 1) {
      const city = province.children[cityIndex]
      for (let areaIndex = 0; areaIndex < city.children.length; areaIndex += 1) {
        const area = city.children[areaIndex]
        if (text.includes(province.label) || text.includes(city.label) || text.includes(area.label)) {
          return { provinceIndex, cityIndex, areaIndex, labels: [province.label, city.label, area.label] }
        }
      }
    }
  }

  return null
}

const selectAddress = (address) => {
  if (addressType.value && eventChannel) {
    eventChannel.emit('selectAddress', {
      type: addressType.value,
      address,
    })
    uni.navigateBack()
  }
}

const startAddAddress = () => {
  editingAddressId.value = null
  parseText.value = ''
  addressForm.value = { name: '', phone: '', detail: '' }
  defaultAddress.value = false
  setRegionByLabels(['四川省', '成都市', '高新区'])
  pageMode.value = 'form'
}

const editAddress = (address) => {
  editingAddressId.value = address.id
  parseText.value = ''
  addressForm.value = {
    name: address.name,
    phone: address.phone,
    detail: address.detail,
  }
  defaultAddress.value = address.default

  const region = findRegionByText(address.region)
  if (region) {
    setRegionByLabels(region.labels)
  } else {
    selectedRegion.value = [address.region, '', ''].filter(Boolean)
  }

  pageMode.value = 'form'
}

const clearParseText = () => {
  parseText.value = ''
}

const recognizeAddress = () => {
  const text = parseText.value.trim()
  if (!text) {
    return
  }

  const phone = text.match(/1[3-9]\d{9}/)?.[0] || ''
  const normalized = text.replace(/[，,。；;\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
  const parts = normalized.split(' ').filter(Boolean)

  if (phone) {
    addressForm.value.phone = phone
  }

  const namePart = parts.find((part) => part !== phone && !part.includes('省') && !part.includes('市') && !part.includes('区'))
  if (namePart) {
    addressForm.value.name = namePart
  }

  const region = findRegionByText(text)
  if (region) {
    selectedRegion.value = region.labels
    regionPickerIndex.value = [region.provinceIndex, region.cityIndex, region.areaIndex]
    updateRegionColumns(region.provinceIndex, region.cityIndex)
  }

  const detail = normalized
    .replace(addressForm.value.name, '')
    .replace(addressForm.value.phone, '')
    .replace(selectedRegion.value.join(''), '')
    .replace(selectedRegion.value.join(' '), '')
    .trim()
  if (detail) {
    addressForm.value.detail = detail
  }
}

const saveAddress = () => {
  const payload = {
    name: addressForm.value.name,
    phone: addressForm.value.phone,
    region: selectedRegionText.value,
    detail: addressForm.value.detail,
    default: defaultAddress.value,
  }

  if (payload.default) {
    addressList.value = addressList.value.map((item) => ({ ...item, default: false }))
  }

  if (editingAddressId.value) {
    addressList.value = addressList.value.map((item) => (item.id === editingAddressId.value ? { ...item, ...payload } : item))
  } else {
    addressList.value.push({ id: Date.now(), ...payload })
  }

  editingAddressId.value = null
  pageMode.value = 'list'
}

const handleBack = () => {
  if (pageMode.value === 'form') {
    pageMode.value = 'list'
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

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  eventChannel = currentPage?.getOpenerEventChannel?.()
  addressType.value = currentPage?.options?.type || ''
})
</script>

<style>
page {
  background: #f3f4f6;
}

.address-root {
  min-height: 100vh;
  background: #f3f4f6;
}

.head-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}

.address-page {
  min-height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 18rpx 22rpx 150rpx;
  box-sizing: border-box;
}

.address-search {
  height: 64rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border-radius: 34rpx;
  background: #ffffff;
  color: #c0c4cc;
  font-size: 22rpx;
  box-sizing: border-box;
}

.address-search text {
  margin-left: 12rpx;
}

.wechat-address-row {
  height: 72rpx;
  margin-top: 24rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border-radius: 10rpx;
  background: #ffffff;
  color: #1f2937;
  font-size: 24rpx;
  box-sizing: border-box;
}

.wechat-address-row text {
  flex: 1;
  margin-left: 14rpx;
}

.wechat-icon {
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #65c823;
}

.address-list-card {
  margin-top: 24rpx;
}

.address-list-item {
  padding: 28rpx 24rpx 20rpx;
  margin-bottom: 18rpx;
  border-radius: 10rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.address-list-main {
  padding-bottom: 18rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.address-user-row {
  display: flex;
  align-items: center;
}

.address-user {
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.address-phone {
  margin-left: 18rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.address-detail {
  display: block;
  margin-top: 8rpx;
  color: #8b95a1;
  font-size: 23rpx;
  line-height: 30rpx;
}

.address-card-footer {
  height: 58rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.default-address {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 22rpx;
}

.default-dot {
  width: 20rpx;
  height: 20rpx;
  margin-right: 8rpx;
  border: 2rpx solid #c6ccd5;
  border-radius: 50%;
  box-sizing: border-box;
}

.default-dot.active {
  border-color: #4d8df7;
  background: #4d8df7;
}

.address-actions {
  display: flex;
  align-items: center;
}

.address-actions text {
  width: 92rpx;
  height: 42rpx;
  margin-left: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #cfd6e0;
  border-radius: 22rpx;
  color: #6b7280;
  font-size: 22rpx;
}

.address-empty {
  height: 440rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 26rpx;
  font-weight: 600;
}

.address-empty-btn {
  width: 170rpx;
  height: 58rpx;
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  background: #5c91ff;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 500;
}

.address-bottom-bar,
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

.address-manage-btn,
.address-add-btn,
.save-address-btn {
  height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 27rpx;
}

.address-manage-btn {
  width: 190rpx;
  margin-right: 20rpx;
  border: 1rpx solid #4d8df7;
  color: #4d8df7;
}

.address-add-btn,
.save-address-btn {
  flex: 1;
  background: #4d8df7;
  color: #ffffff;
}

.address-form-scroll {
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 18rpx 22rpx 150rpx;
  box-sizing: border-box;
}

.parse-card {
  overflow: hidden;
  border-radius: 10rpx;
  background: #ffffff;
}

.parse-example {
  height: 72rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  background: #1476ff;
  color: #ffffff;
  font-size: 24rpx;
  box-sizing: border-box;
}

.parse-box {
  min-height: 150rpx;
  padding: 24rpx 22rpx 20rpx;
  box-sizing: border-box;
}

.parse-textarea {
  width: 100%;
  min-height: 72rpx;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 34rpx;
}

.parse-placeholder {
  color: #9ca3af;
  font-size: 24rpx;
}

.parse-actions {
  margin-top: 26rpx;
  display: flex;
  justify-content: flex-end;
}

.parse-clear,
.parse-button {
  width: 84rpx;
  height: 42rpx;
  margin-left: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  font-size: 21rpx;
}

.parse-clear {
  border: 1rpx solid #cfd6e0;
  color: #8b95a1;
}

.parse-button {
  background: #4d8df7;
  color: #ffffff;
}

.form-card,
.default-card {
  margin-top: 18rpx;
  border-radius: 10rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.form-card {
  padding: 24rpx 22rpx;
}

.form-row {
  min-height: 86rpx;
  display: flex;
  align-items: center;
}

.form-label {
  width: 150rpx;
  color: #1f2937;
  font-size: 27rpx;
  font-weight: 600;
}

.form-value {
  flex: 1;
  color: #4b5563;
  font-size: 26rpx;
}

.form-input {
  flex: 1;
  height: 60rpx;
  color: #4b5563;
  font-size: 26rpx;
  line-height: 60rpx;
}

.form-placeholder {
  color: #a1a1aa;
  font-size: 26rpx;
}

.default-card {
  height: 78rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1f2937;
  font-size: 26rpx;
}

.switch {
  width: 54rpx;
  height: 32rpx;
  padding: 3rpx;
  border-radius: 18rpx;
  background: #d1d5db;
  box-sizing: border-box;
}

.switch view {
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s;
}

.switch.active {
  background: #4d8df7;
}

.switch.active view {
  transform: translateX(22rpx);
}

.save-address-btn {
  width: 100%;
  flex: 1;
}
</style>
