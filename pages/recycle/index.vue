<template>
  <view class="recycle-page">
    <view class="hero">
      <AppHead title="旧衣回收" show-back background-color="transparent" title-color="#ffffff" icon-color="#ffffff"></AppHead>
      <view class="hero-copy">
        <text class="hero-title">旧衣回收就选寄速通</text>
        <text class="hero-title">多品类可打包一起回收</text>
      </view>
      <view class="category-card">
        <view v-for="item in categories" :key="item" class="category-item">
          <view class="category-img">{{ item.slice(0, 1) }}</view>
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <view class="content">
      <view class="form-card">
        <view class="title-row">
          <text class="section-title">上门取件地址</text>
          <view class="free-tag">全程包邮</view>
        </view>
        <view class="tip">可将衣物打包后放置在门口，无需等待快递上门</view>
        <view class="form-row" @tap="goAddress">
          <view class="row-icon">⌖</view>
          <text class="row-label">取件地址</text>
          <text class="row-value">{{ address ? `${address.name} ${address.phone}` : '请选择或新建地址' }}</text>
          <UvIcon name="arrow-right" color="#777777" size="20"></UvIcon>
        </view>
        <view class="form-row" @tap="showTimePopup = true">
          <view class="row-icon">◷</view>
          <text class="row-label">上门时间</text>
          <text class="row-value">{{ pickupTime || '预约上门时间（可选未来15天）' }}</text>
          <UvIcon name="arrow-right" color="#777777" size="20"></UvIcon>
        </view>
        <view class="weight-title">预估重量</view>
        <view class="weight-grid">
          <view v-for="item in weights" :key="item.value" class="weight-card" :class="{ active: weight === item.value }" @tap="weight = item.value">
            <text class="weight-main">{{ item.value }}</text>
            <text class="weight-desc">{{ item.desc }}</text>
          </view>
        </view>
        <view class="green-tip">1kg旧衣≈5.38kg碳排放量，0.27㎡绿化</view>
        <view class="agree-row">
          <view class="agree-dot">✓</view>
          <text>我已阅读并同意</text>
          <text class="link">《球旧衣上门回收用户协议》</text>
        </view>
      </view>

      <view class="where-card">
        <text class="section-title">旧衣都去哪儿了?</text>
        <view class="where-grid">
          <view v-for="item in disposeWays" :key="item.title" class="where-item" :style="{ background: item.bg }">
            <text>{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-submit">
      <view class="submit-btn" @tap="submit">确认提交</view>
    </view>

    <view v-if="showTimePopup" class="popup-mask" @tap.self="showTimePopup = false">
      <view class="time-popup">
        <text class="popup-title">选择上门时间</text>
        <view class="time-grid">
          <view v-for="item in times" :key="item" class="time-item" :class="{ active: pickupTime === item }" @tap="pickupTime = item">{{ item }}</view>
        </view>
        <view class="submit-btn small" @tap="showTimePopup = false">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const categories = ['四季衣物', '各类鞋靴', '围巾帽子', '床单被罩', '闲置旧包', '毛绒玩具']
const weights = [
  { value: '3-10kg', desc: '约20件' },
  { value: '10-20kg', desc: '约40件' },
  { value: '20-50kg', desc: '约60件' },
  { value: '50kg以上', desc: '约150件' },
]
const disposeWays = [
  { title: '环保再生处理', bg: '#c4d5ec' },
  { title: '二手流转处理', bg: '#e2c6a8' },
  { title: '旧衣出口处理', bg: '#b8d4ef' },
]
const times = ['今天 14:00-18:00', '明天 09:00-12:00', '明天 14:00-18:00', '后天 09:00-12:00']
const weight = ref('10-20kg')
const pickupTime = ref('')
const showTimePopup = ref(false)
const address = ref(null)

const goAddress = () => {
  uni.navigateTo({
    url: '/pages/address/index?type=sender',
    events: {
      selectAddress(payload) {
        address.value = payload.address
      },
    },
  })
}

const submit = () => {
  uni.showToast({ title: '回收订单已提交', icon: 'none' })
}
</script>

<style>
page {
  background: #f2f3f6;
}

.recycle-page {
  min-height: 100vh;
  padding-bottom: 150rpx;
  background: #f2f3f6;
}

.hero {
  min-height: 720rpx;
  padding-bottom: 30rpx;
  background: linear-gradient(135deg, #5a8fff 0%, #a7caf5 52%, #32dcc0 100%);
}

.hero-copy {
  padding: 70rpx 48rpx 30rpx;
}

.hero-title {
  display: block;
  color: #ffffff;
  font-size: 46rpx;
  font-weight: 900;
  font-style: italic;
  line-height: 58rpx;
}

.category-card {
  margin: 36rpx 30rpx 0;
  padding: 30rpx 22rpx;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  border-radius: 14rpx;
  background: #ffffff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666666;
  font-size: 22rpx;
}

.category-img {
  width: 72rpx;
  height: 54rpx;
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #edf5ff;
  color: #4b8dff;
}

.content {
  margin-top: -300rpx;
  padding: 0 30rpx;
}

.form-card,
.where-card {
  padding: 32rpx 24rpx;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.where-card {
  margin-top: 24rpx;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 34rpx;
  font-weight: 800;
  border-bottom: 8rpx solid #5c91ff;
}

.free-tag {
  height: 48rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 24rpx;
  background: #eaf2ff;
  color: #438bff;
  font-size: 24rpx;
}

.tip {
  height: 48rpx;
  margin-top: 28rpx;
  padding: 0 24rpx;
  border-radius: 7rpx;
  background: #fff0e8;
  color: #ff5a00;
  font-size: 26rpx;
  line-height: 48rpx;
}

.form-row {
  min-height: 112rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #edf0f5;
}

.row-icon {
  width: 44rpx;
  margin-right: 18rpx;
  color: #4b8dff;
  font-size: 34rpx;
}

.row-label {
  width: 150rpx;
  font-size: 31rpx;
}

.row-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #999999;
  font-size: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weight-title {
  margin-top: 28rpx;
  font-size: 31rpx;
}

.weight-grid {
  margin-top: 26rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.weight-card {
  height: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #c7cdd6;
  border-radius: 14rpx;
}

.weight-card.active {
  border-color: #438bff;
  background: #eef4ff;
  color: #438bff;
}

.weight-main {
  font-size: 29rpx;
  font-weight: 800;
}

.weight-desc {
  margin-top: 12rpx;
  color: #999999;
  font-size: 25rpx;
}

.green-tip {
  height: 64rpx;
  margin-top: 34rpx;
  padding: 0 22rpx;
  border-radius: 12rpx;
  background: #eaf9ef;
  color: #20b933;
  font-size: 25rpx;
  line-height: 64rpx;
}

.agree-row {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  color: #999999;
  font-size: 25rpx;
}

.agree-dot {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #27c33b;
  color: #ffffff;
}

.link {
  color: #438bff;
}

.where-grid {
  margin-top: 34rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}

.where-item {
  height: 152rpx;
  padding-top: 98rpx;
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 25rpx;
  text-align: center;
  box-sizing: border-box;
}

.bottom-submit {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 50rpx calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
}

.submit-btn {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #4b8dff;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.submit-btn.small {
  height: 78rpx;
  margin-top: 28rpx;
  font-size: 30rpx;
}

.time-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 34rpx 30rpx calc(30rpx + env(safe-area-inset-bottom));
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

.popup-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
}

.time-grid {
  margin-top: 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.time-item {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #d8dce4;
  border-radius: 10rpx;
  font-size: 26rpx;
}

.time-item.active {
  border-color: #438bff;
  color: #438bff;
  background: #eef4ff;
}
</style>
