<template>
  <view class="page">
    <AppHead :title="mode === 'form' ? (form.id ? '编辑地址' : '新增地址') : '地址簿'" show-back></AppHead>

    <template v-if="mode === 'list'">
      <view class="search">
        <input v-model="search" class="search-input" placeholder="搜索 name / tel" confirm-type="search" @confirm="reload" />
        <button class="search-btn" @tap="reload">搜索</button>
      </view>

      <scroll-view scroll-y class="list">
        <view v-if="loading" class="empty">加载中...</view>
        <view v-else-if="!rows.length" class="empty">
          <text>暂无地址</text>
          <button class="empty-btn" @tap="createAddress">新增地址</button>
        </view>
        <view v-else v-for="item in rows" :key="item.id" class="card" @tap="selectAddress(item)">
          <view class="card-head">
            <text>{{ item.name || '-' }}</text>
            <text>{{ item.tel || '-' }}</text>
          </view>
          <text class="address">{{ addressLine(item) || '-' }}</text>
          <view class="actions">
            <button @tap.stop="editAddress(item)">编辑</button>
            <button @tap.stop="removeAddress(item.id)">删除</button>
          </view>
        </view>
      </scroll-view>

      <view class="bottom">
        <button class="primary" @tap="createAddress">新增地址</button>
      </view>
    </template>

    <template v-else>
      <scroll-view scroll-y class="form-scroll">
        <view class="parse">
          <textarea v-model="parseText" placeholder="粘贴地址文本，点击识别" />
          <button @tap="parseAddress">识别</button>
        </view>
        <view class="form-card">
          <view class="field"><text>name</text><input v-model="form.name" placeholder="联系人" /></view>
          <view class="field"><text>tel</text><input v-model="form.tel" type="number" maxlength="11" placeholder="手机号" /></view>
          <view class="field"><text>province</text><input v-model="form.province" placeholder="省" /></view>
          <view class="field"><text>city</text><input v-model="form.city" placeholder="市" /></view>
          <view class="field"><text>district</text><input v-model="form.district" placeholder="区/县" /></view>
          <view class="field"><text>address</text><input v-model="form.address" placeholder="详细地址" /></view>
        </view>
      </scroll-view>
      <view class="bottom">
        <button class="primary" :loading="saving" :disabled="saving" @tap="saveAddress">保存</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import { addressApi } from '@/services/api'
import { addressLine, getRows } from '@/utils/api-fields'

const mode = ref('list')
const rows = ref([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const parseText = ref('')
let eventChannel = null
const selectType = ref('')

const form = reactive({
  id: '',
  name: '',
  tel: '',
  province: '',
  city: '',
  district: '',
  address: '',
})

const resetForm = (item = {}) => {
  form.id = item.id || ''
  form.name = item.name || ''
  form.tel = item.tel || ''
  form.province = item.province || ''
  form.city = item.city || ''
  form.district = item.district || ''
  form.address = item.address || ''
}

const reload = async () => {
  loading.value = true
  try {
    const data = await addressApi.list({ page: 1, pageSize: 50, search: search.value })
    rows.value = getRows(data)
  } catch (error) {
    uni.showToast({ title: error.message || '地址加载失败', icon: 'none' })
    rows.value = []
  } finally {
    loading.value = false
  }
}

const selectAddress = (item) => {
  if (!selectType.value || !eventChannel) return
  eventChannel.emit('selectAddress', { type: selectType.value, address: item })
  uni.navigateBack()
}

const createAddress = () => {
  resetForm()
  parseText.value = ''
  mode.value = 'form'
}

const editAddress = async (item) => {
  try {
    const detail = await addressApi.detail(item.id)
    resetForm(detail || item)
  } catch {
    resetForm(item)
  }
  mode.value = 'form'
}

const parseAddress = async () => {
  if (!parseText.value.trim()) return
  try {
    const data = await addressApi.parse(parseText.value.trim())
    ;['name', 'tel', 'province', 'city', 'district', 'address'].forEach((key) => {
      if (data?.[key]) form[key] = data[key]
    })
  } catch (error) {
    uni.showToast({ title: error.message || '识别失败', icon: 'none' })
  }
}

const saveAddress = async () => {
  if (!form.name || !form.tel || !form.province || !form.city || !form.district || !form.address) {
    uni.showToast({ title: '请完整填写地址字段', icon: 'none' })
    return
  }
  saving.value = true
  const payload = {
    name: form.name,
    tel: form.tel,
    province: form.province,
    city: form.city,
    district: form.district,
    address: form.address,
  }
  try {
    if (form.id) await addressApi.update({ ...payload, id: form.id })
    else await addressApi.create(payload)
    mode.value = 'list'
    await reload()
  } catch (error) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

const removeAddress = (id) => {
  uni.showModal({
    title: '删除地址',
    content: '确认删除该地址吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await addressApi.remove(id)
        await reload()
      } catch (error) {
        uni.showToast({ title: error.message || '删除失败', icon: 'none' })
      }
    },
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  eventChannel = current?.getOpenerEventChannel?.()
  selectType.value = current?.options?.type || ''
  reload()
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

.search {
  padding: 20rpx 28rpx;
  display: flex;
  gap: 16rpx;
  background: #ffffff;
}

.search-input {
  flex: 1;
  height: 68rpx;
  padding: 0 24rpx;
  border-radius: 34rpx;
  background: #f3f5f8;
  color: #111827;
  font-size: 25rpx;
  box-sizing: border-box;
}

.search-btn {
  width: 128rpx;
  height: 68rpx;
  border-radius: 34rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 68rpx;
}

.list,
.form-scroll {
  height: calc(100vh - 176rpx - var(--status-bar-height));
  padding: 24rpx 28rpx 150rpx;
  box-sizing: border-box;
}

.card,
.form-card,
.parse {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 14rpx;
  background: #ffffff;
}

.card-head {
  display: flex;
  justify-content: space-between;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.address {
  display: block;
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 25rpx;
  line-height: 36rpx;
}

.actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.actions button {
  width: 112rpx;
  height: 54rpx;
  border-radius: 28rpx;
  background: #eef2f7;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 54rpx;
}

.empty {
  min-height: 520rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b95a1;
  font-size: 28rpx;
}

.empty-btn {
  width: 190rpx;
  height: 68rpx;
  margin-top: 28rpx;
  border-radius: 34rpx;
  background: #438bff;
  color: #ffffff;
  line-height: 68rpx;
}

.parse textarea {
  width: 100%;
  min-height: 140rpx;
  color: #4b5563;
  font-size: 25rpx;
  line-height: 36rpx;
}

.parse button {
  height: 60rpx;
  margin-top: 16rpx;
  border-radius: 30rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 60rpx;
}

.field {
  min-height: 90rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #edf0f5;
}

.field:last-child {
  border-bottom: none;
}

.field text {
  width: 150rpx;
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.field input {
  flex: 1;
  height: 70rpx;
  color: #4b5563;
  font-size: 26rpx;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-sizing: border-box;
}

.primary {
  height: 82rpx;
  border-radius: 12rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 82rpx;
}
</style>
