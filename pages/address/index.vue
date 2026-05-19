<template>
  <view class="address-root">
    <AppHead :title="pageTitle" show-back></AppHead>

    <template v-if="pageMode === 'list'">
      <view class="address-page">
        <view class="address-search">
          <UvIcon name="search" color="#9ca3af" size="17"></UvIcon>
          <text>请输入姓名/手机号/公司名称</text>
        </view>

        <view class="wechat-address-row">
          <view class="wechat-icon">微</view>
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
                <text @tap.stop="deleteAddress(item.id)">删除</text>
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
        <view class="address-manage-btn" @tap="manageMode = !manageMode">{{ manageMode ? '完成' : '管理' }}</view>
        <view class="address-add-btn" @tap="startAddAddress">添加地址</view>
      </view>
    </template>

    <template v-else>
      <scroll-view scroll-y class="address-form-scroll">
        <view class="parse-card">
          <view class="parse-example">示例: 姓名，187****9989，上海市静安区XXX</view>
          <view class="parse-box">
            <textarea
              v-model="parseText"
              class="parse-textarea"
              placeholder="请粘贴或输入文本，点击“识别”自动填充姓名、手机号、地址"
              placeholder-class="parse-placeholder"
            />
            <view class="parse-actions">
              <view class="parse-clear" @tap="parseText = ''">清空</view>
              <view class="parse-button" @tap="recognizeAddress">识别</view>
            </view>
          </view>
        </view>

        <view class="form-card">
          <view class="form-row">
            <text class="form-label">联系人</text>
            <input v-model="addressForm.name" class="form-input" placeholder="请输入联系人" />
          </view>
          <view class="form-row">
            <text class="form-label">联系电话</text>
            <input v-model="addressForm.phone" class="form-input" type="number" maxlength="11" placeholder="请输入联系电话" />
          </view>
          <view class="form-row">
            <text class="form-label">所在地区</text>
            <input v-model="addressForm.region" class="form-input" placeholder="省 市 区" />
            <UvIcon name="map-fill" color="#4d8df7" size="19"></UvIcon>
          </view>
          <view class="form-row">
            <text class="form-label">详细地址</text>
            <input v-model="addressForm.detail" class="form-input" placeholder="请输入详细地址" />
          </view>
        </view>

        <view class="default-card">
          <text>设置为默认地址</text>
          <view class="switch" :class="{ active: defaultAddress }" @tap="defaultAddress = !defaultAddress"><view></view></view>
        </view>
      </scroll-view>

      <view class="save-address-bar">
        <view class="save-address-btn" @tap="saveAddress">保存</view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'
import { addressApi } from '@/services/api'

const pageMode = ref('list')
const addressType = ref('')
const parseText = ref('')
const editingAddressId = ref(null)
const defaultAddress = ref(true)
const manageMode = ref(false)
const loading = ref(false)
let eventChannel = null

const addressForm = ref({
  name: '',
  phone: '',
  region: '四川省 成都市 高新区',
  detail: '',
})

const addressList = ref([
  {
    id: 1,
    name: '何其为',
    phone: '17712345678',
    region: '北京市 北京市 昌平区 沙河镇站前路',
    detail: '木器厂宿舍',
    default: true,
  },
  {
    id: 2,
    name: '何为',
    phone: '15812347856',
    region: '四川省 成都市 双流区 新通大道龙腾',
    detail: '苑宿舍',
    default: false,
  },
])

const toViewAddress = (item) => ({
  id: item.id,
  name: item.name || '',
  phone: item.tel || item.phone || '',
  region: [item.province, item.city, item.district].filter(Boolean).join(' ') || item.region || '',
  detail: item.address || item.detail || '',
  default: Boolean(item.default),
})

const splitRegion = (region) => {
  const parts = String(region || '').split(/\s+/).filter(Boolean)
  return {
    province: parts[0] || '',
    city: parts[1] || '',
    district: parts.slice(2).join(' ') || '',
  }
}

const toApiAddress = () => {
  const region = splitRegion(addressForm.value.region)
  return {
    name: addressForm.value.name,
    tel: addressForm.value.phone,
    ...region,
    address: addressForm.value.detail,
  }
}

const loadAddressList = async () => {
  loading.value = true
  try {
    const data = await addressApi.list()
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    addressList.value = rows.map(toViewAddress)
  } catch (error) {
    console.warn('load address list failed', error)
  } finally {
    loading.value = false
  }
}

const pageTitle = computed(() => {
  if (pageMode.value === 'form') return editingAddressId.value ? '修改地址' : '添加地址'
  return '地址簿'
})

const selectAddress = (address) => {
  if (!addressType.value || !eventChannel) return
  eventChannel.emit('selectAddress', { type: addressType.value, address })
  uni.navigateBack()
}

const startAddAddress = () => {
  editingAddressId.value = null
  parseText.value = ''
  addressForm.value = { name: '', phone: '', region: '四川省 成都市 高新区', detail: '' }
  defaultAddress.value = false
  pageMode.value = 'form'
}

const editAddress = (address) => {
  editingAddressId.value = address.id
  parseText.value = ''
  addressForm.value = {
    name: address.name,
    phone: address.phone,
    region: address.region,
    detail: address.detail,
  }
  defaultAddress.value = address.default
  pageMode.value = 'form'
}

const deleteAddress = async (id) => {
  try {
    await addressApi.remove(id)
    addressList.value = addressList.value.filter((item) => item.id !== id)
    uni.showToast({ title: '已删除', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error.message || '删除失败', icon: 'none' })
  }
}

const applyParsedAddress = (parsed) => {
  const region = [parsed.province, parsed.city, parsed.district].filter(Boolean).join(' ')
  if (parsed.tel || parsed.phone) addressForm.value.phone = parsed.tel || parsed.phone
  if (parsed.name) addressForm.value.name = parsed.name
  if (region) addressForm.value.region = region
  if (parsed.address || parsed.detail) addressForm.value.detail = parsed.address || parsed.detail
}

const recognizeAddressLocally = (text) => {
  if (!text) return
  const phone = text.match(/1[3-9]\d{9}/)?.[0] || ''
  const parts = text.replace(/[，,。;\n\r]/g, ' ').split(/\s+/).filter(Boolean)
  const name = parts.find((part) => part !== phone && !/[省市区县镇路号]/.test(part)) || parts[0] || ''
  const regionMatch = text.match(/([\u4e00-\u9fa5]+省)?[\u4e00-\u9fa5]+市[\u4e00-\u9fa5]+[区县]/)

  if (phone) addressForm.value.phone = phone
  if (name) addressForm.value.name = name
  if (regionMatch) addressForm.value.region = regionMatch[0].replace(/省|市/g, (m) => `${m} `).trim()
  addressForm.value.detail = text.replace(phone, '').replace(name, '').replace(regionMatch?.[0] || '', '').trim()
}

const recognizeAddress = async () => {
  const text = parseText.value.trim()
  if (!text) return
  try {
    const data = await addressApi.parse(text)
    if (data && Object.keys(data).length) {
      applyParsedAddress(data)
      return
    }
  } catch (error) {
    console.warn('parse address failed', error)
  }
  recognizeAddressLocally(text)
}

const saveAddress = async () => {
  if (!addressForm.value.name || !addressForm.value.phone || !addressForm.value.detail) {
    uni.showToast({ title: '请填写完整地址', icon: 'none' })
    return
  }

  const apiPayload = toApiAddress()
  try {
    if (editingAddressId.value) {
      await addressApi.update({ ...apiPayload, id: editingAddressId.value })
    } else {
      await addressApi.create(apiPayload)
    }
    await loadAddressList()
    pageMode.value = 'list'
  } catch (error) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  eventChannel = currentPage?.getOpenerEventChannel?.()
  addressType.value = currentPage?.options?.type || ''
  loadAddressList()
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

.address-page,
.address-form-scroll {
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
  font-size: 24rpx;
  box-sizing: border-box;
}

.wechat-address-row text {
  flex: 1;
  margin-left: 14rpx;
}

.wechat-icon {
  width: 34rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #65c823;
  color: #ffffff;
  font-size: 18rpx;
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

.default-address,
.address-actions {
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

.address-actions text {
  width: 92rpx;
  height: 42rpx;
  margin-left: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #cfd6e0;
  border-radius: 22rpx;
}

.address-empty {
  height: 440rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.parse-card,
.form-card,
.default-card {
  border-radius: 10rpx;
  background: #ffffff;
  overflow: hidden;
}

.parse-example {
  height: 72rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  background: #1476ff;
  color: #ffffff;
  font-size: 24rpx;
}

.parse-box {
  padding: 24rpx 22rpx 20rpx;
}

.parse-textarea {
  width: 100%;
  min-height: 120rpx;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 34rpx;
}

.parse-placeholder {
  color: #9ca3af;
}

.parse-actions {
  margin-top: 20rpx;
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
  font-size: 27rpx;
  font-weight: 600;
}

.form-input {
  flex: 1;
  height: 60rpx;
  color: #4b5563;
  font-size: 26rpx;
}

.default-card {
  height: 78rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.switch.active {
  background: #4d8df7;
}

.switch.active view {
  transform: translateX(22rpx);
}
</style>
