<template>
  <view class="page">
    <view class="hero">
      <view class="user" @tap="handleLogin">
        <image class="avatar" :src="profile.avatar || '/static/logo.png'" mode="aspectFill"></image>
        <view class="user-copy">
          <text class="name">{{ isLoggedIn ? userLabel(profile) : '未登录' }}</text>
          <text class="meta">{{ isLoggedIn ? `user_id: ${profile.user_id || profile.id || '-'}` : '点击登录后获取个人信息' }}</text>
        </view>
      </view>
    </view>

    <view class="panel stats">
      <view class="stat">
        <text>{{ profile.score || 0 }}</text>
        <text>积分</text>
      </view>
      <view class="stat">
        <text>{{ profile.mobile || '-' }}</text>
        <text>手机号</text>
      </view>
      <view class="stat">
        <text>{{ profile.openid ? '已绑定' : '-' }}</text>
        <text>openid</text>
      </view>
    </view>

    <view class="panel menu">
      <view class="menu-item" @tap="go('/pages/address/index')">
        <text>地址管理</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="go('/pages/express/index')">
        <text>订单列表</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="openEdit">
        <text>编辑个人资料</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="openStats">
        <text>数据统计 / 导出</text>
        <text>></text>
      </view>
      <view class="menu-item" @tap="loadProfile">
        <text>刷新个人信息</text>
        <text>></text>
      </view>
      <view v-if="isLoggedIn" class="menu-item danger" @tap="logout">
        <text>退出登录</text>
        <text>></text>
      </view>
    </view>

    <view v-if="editVisible" class="mask" @tap.self="editVisible = false">
      <view class="sheet">
        <view class="sheet-head"><text>编辑资料</text><text @tap="editVisible = false">×</text></view>
        <view class="avatar-edit" @tap="chooseAvatar">
          <image :src="editForm.avatar || '/static/logo.png'" mode="aspectFill"></image>
          <text>{{ uploading ? '上传中...' : '更换头像' }}</text>
        </view>
        <view class="field"><text>昵称</text><input v-model="editForm.nickname" placeholder="请输入昵称" /></view>
        <view class="field"><text>手机号</text><input v-model="editForm.mobile" type="number" maxlength="11" placeholder="请输入手机号" /></view>
        <button class="primary" :loading="saving" :disabled="saving" @tap="saveProfile">保存资料</button>
      </view>
    </view>

    <view v-if="statsVisible" class="mask" @tap.self="statsVisible = false">
      <view class="sheet stats-sheet">
        <view class="sheet-head"><text>数据统计</text><text @tap="statsVisible = false">×</text></view>
        <view class="date-row">
          <picker mode="date" :value="statsDate" @change="changeStatsDate">
            <view class="date-picker">{{ statsDate || '选择日期' }}</view>
          </picker>
          <button :loading="statsLoading" :disabled="statsLoading" @tap="loadStats(true)">查询</button>
          <button :loading="exporting" :disabled="exporting" @tap="exportStats">导出</button>
        </view>
        <scroll-view scroll-y class="stats-list" @scrolltolower="loadStats(false)">
          <view v-if="statsLoading && !statRows.length" class="empty">加载中...</view>
          <view v-else-if="!statRows.length" class="empty">暂无统计数据</view>
          <template v-else>
            <view v-for="item in statRows" :key="item.id" class="stat-card">
              <view class="stat-card-head">
                <text>{{ item.order_sn || `订单 ${item.id}` }}</text>
                <text>¥{{ moneyText(item.actual_payment_price || item.origin_price) }}</text>
              </view>
              <text>{{ item.delivery_type || '-' }} / {{ item.item_type || '-' }} / {{ item.weight || '-' }}kg</text>
              <text>{{ item.createtime || '-' }}</text>
            </view>
          </template>
          <view v-if="statRows.length" class="load">{{ statsFinished ? '没有更多了' : '上拉加载更多' }}</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { commonApi, userApi } from '@/services/api'
import { API_BASE_URL, clearAuth } from '@/services/request'
import { useUserStore } from '@/store'
import { getRows, moneyText, userLabel } from '@/utils/api-fields'

const userStore = useUserStore()
const remoteProfile = ref({})
const editVisible = ref(false)
const statsVisible = ref(false)
const saving = ref(false)
const uploading = ref(false)
const statsLoading = ref(false)
const exporting = ref(false)
const statRows = ref([])
const statsPage = ref(1)
const statsFinished = ref(false)
const statsPageSize = 10
const statsDate = ref('')

const editForm = reactive({
  avatar: '',
  nickname: '',
  mobile: '',
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const profile = computed(() => ({ ...(userStore.userInfo || {}), ...(remoteProfile.value || {}) }))

const go = (url) => {
  if (url === '/pages/express/index') uni.switchTab({ url })
  else uni.navigateTo({ url })
}

const requireLogin = () => {
  if (isLoggedIn.value) return true
  handleLogin()
  return false
}

const handleLogin = () => {
  if (isLoggedIn.value) return
  uni.navigateTo({ url: '/pages/login/index?redirect=/pages/profile/index' })
}

const loadProfile = async () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  try {
    const data = await userApi.getUserInfo()
    remoteProfile.value = data || {}
    userStore.setUserInfo(data || {})
  } catch (error) {
    uni.showToast({ title: error.message || '个人信息加载失败', icon: 'none' })
  }
}

const openEdit = () => {
  if (!requireLogin()) return
  editForm.avatar = profile.value.avatar || ''
  editForm.nickname = profile.value.nickname || ''
  editForm.mobile = profile.value.mobile || ''
  editVisible.value = true
}

const chooseAvatar = () => {
  if (uploading.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths?.[0]
      if (!filePath) return
      uploading.value = true
      try {
        const data = await commonApi.upload(filePath)
        editForm.avatar = data?.fullurl || data?.url || filePath
      } catch (error) {
        uni.showToast({ title: error.message || '头像上传失败', icon: 'none' })
      } finally {
        uploading.value = false
      }
    },
  })
}

const saveProfile = async () => {
  if (!editForm.nickname || !editForm.mobile) {
    uni.showToast({ title: '请填写昵称和手机号', icon: 'none' })
    return
  }
  saving.value = true
  try {
    await userApi.updateUserInfo({
      avatar: editForm.avatar,
      nickname: editForm.nickname,
      mobile: editForm.mobile,
    })
    const nextProfile = { ...profile.value, ...editForm }
    remoteProfile.value = nextProfile
    userStore.setUserInfo(nextProfile)
    editVisible.value = false
    uni.showToast({ title: '保存成功', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

const openStats = () => {
  if (!requireLogin()) return
  statsVisible.value = true
  if (!statRows.value.length) loadStats(true)
}

const changeStatsDate = (event) => {
  statsDate.value = event.detail.value
  loadStats(true)
}

const loadStats = async (reset = false) => {
  if (!isLoggedIn.value || statsLoading.value || (statsFinished.value && !reset)) return
  if (reset) {
    statsPage.value = 1
    statsFinished.value = false
  }
  statsLoading.value = true
  try {
    const params = { page: statsPage.value, pageSize: statsPageSize }
    if (statsDate.value) params.date = statsDate.value
    const data = await userApi.dataCount(params)
    const rows = getRows(data)
    statRows.value = reset ? rows : statRows.value.concat(rows)
    const lastPage = Number(data?.last_page || 0)
    statsFinished.value = rows.length < statsPageSize || (lastPage ? statsPage.value >= lastPage : false)
    if (!statsFinished.value) statsPage.value += 1
  } catch (error) {
    uni.showToast({ title: error.message || '统计加载失败', icon: 'none' })
  } finally {
    statsLoading.value = false
  }
}

const resolveFileUrl = (value = '') => {
  const url = String(value).replace(/\\/g, '/')
  if (/^https?:\/\//.test(url)) return url
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const exportStats = async () => {
  if (!statsDate.value) {
    uni.showToast({ title: '请先选择导出日期', icon: 'none' })
    return
  }
  exporting.value = true
  try {
    const file = await userApi.dataCountExport(statsDate.value)
    const url = resolveFileUrl(file)
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          uni.openDocument({
            filePath: res.tempFilePath,
            fail: () => uni.setClipboardData({ data: url }),
          })
          return
        }
        uni.setClipboardData({ data: url })
      },
      fail: () => uni.setClipboardData({ data: url }),
    })
  } catch (error) {
    uni.showToast({ title: error.message || '导出失败', icon: 'none' })
  } finally {
    exporting.value = false
  }
}

const logout = () => {
  clearAuth()
  userStore.logout()
  remoteProfile.value = {}
  statRows.value = []
  uni.showToast({ title: '已退出登录', icon: 'none' })
}

onMounted(() => {
  if (isLoggedIn.value) loadProfile()
})
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #f5f7fb;
}

.hero {
  padding: calc(var(--status-bar-height) + 64rpx) 32rpx 70rpx;
  background: linear-gradient(135deg, #d8e7ff 0%, #d9fff1 100%);
}

.user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #ffffff;
}

.user-copy {
  flex: 1;
  min-width: 0;
  margin-left: 26rpx;
}

.name {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 38rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: block;
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 25rpx;
}

.panel {
  margin: 24rpx 30rpx 0;
  border-radius: 14rpx;
  background: #ffffff;
}

.stats {
  padding: 32rpx 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.stat {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat text:first-child {
  max-width: 180rpx;
  overflow: hidden;
  color: #111827;
  font-size: 29rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat text:last-child {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.menu {
  padding: 0 24rpx;
}

.menu-item {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
  color: #111827;
  font-size: 28rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.danger {
  color: #ef4444;
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
  max-height: 82vh;
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

.avatar-edit {
  padding: 28rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-edit image {
  width: 132rpx;
  height: 132rpx;
  border-radius: 66rpx;
  background: #f3f5f8;
}

.avatar-edit text {
  margin-top: 16rpx;
  color: #438bff;
  font-size: 25rpx;
}

.field {
  min-height: 90rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #edf0f5;
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
  text-align: right;
}

.primary {
  width: 100%;
  height: 82rpx;
  margin-top: 28rpx;
  border-radius: 12rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 82rpx;
}

.stats-sheet {
  height: 82vh;
}

.date-row {
  margin-top: 20rpx;
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.date-picker {
  width: 230rpx;
  height: 66rpx;
  padding: 0 18rpx;
  border-radius: 34rpx;
  background: #f3f5f8;
  color: #4b5563;
  font-size: 25rpx;
  line-height: 66rpx;
}

.date-row button {
  width: 128rpx;
  height: 66rpx;
  border-radius: 34rpx;
  background: #438bff;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 66rpx;
}

.stats-list {
  height: calc(82vh - 180rpx);
  margin-top: 22rpx;
}

.empty,
.load {
  padding: 70rpx 0;
  text-align: center;
  color: #8b95a1;
  font-size: 26rpx;
}

.stat-card {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 14rpx;
  background: #f6f9ff;
}

.stat-card-head {
  display: flex;
  justify-content: space-between;
  color: #111827;
  font-size: 27rpx;
  font-weight: 800;
}

.stat-card-head text:first-child {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-card > text {
  display: block;
  margin-top: 12rpx;
  color: #6b7280;
  font-size: 24rpx;
}
</style>
