<template>
  <view class="life-page">
    <view class="hero">
      <view class="top-row">
        <text class="page-title">人人寄福利中心</text>
        <view class="capsule">
          <UvIcon name="more-dot-fill" color="#000000" size="22"></UvIcon>
          <view class="capsule-line"></view>
          <view class="capsule-circle"></view>
        </view>
      </view>
    </view>

    <view class="content">
      <view class="video-card">
        <SectionTitle title="寄件福利" />
        <view class="video-row">
          <view class="play-box"><view class="play-icon"></view></view>
          <text class="video-text">看视频换现金</text>
          <view class="finish-btn">去完成</view>
        </view>
      </view>

      <view class="welfare-card">
        <SectionTitle title="寄件福利" />
        <view class="service-grid">
          <view v-for="item in services" :key="item.title" class="service-item" :style="{ background: item.bg }" @tap="go(item.url)">
            <view class="service-icon" :style="{ background: item.color }">
              <text>{{ item.icon }}</text>
            </view>
            <text class="service-title">{{ item.title }}</text>
            <text class="service-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const SectionTitle = defineComponent({
  props: { title: { type: String, required: true } },
  setup(props) {
    return () => h('view', { class: 'section-title-wrap' }, [
      h('text', { class: 'section-title' }, props.title),
      h('view', { class: 'section-underline' }),
      h('view', { class: 'title-mark' }),
    ])
  },
})

const services = [
  { title: '旧衣回收', desc: '旧衣有偿上门回收', color: '#05c970', bg: '#effcf5', icon: '衣', url: '/pages/recycle/index' },
  { title: '饿了么', desc: '外卖红包天天领', color: '#0698f8', bg: '#f0f9ff', icon: 'e' },
  { title: '京东外卖', desc: '立享外卖百亿补贴', color: '#ff3829', bg: '#fff8e9', icon: '京' },
  { title: '美团外卖', desc: '最高立减88元优惠券', color: '#ffc400', bg: '#fff9dd', icon: '美' },
  { title: '滴滴打车', desc: '立享打车5折起', color: '#ff7318', bg: '#fff3ed', icon: 'D' },
  { title: '花小猪', desc: '最高可领100元券包', color: '#bd18d7', bg: '#fff1fc', icon: '猪' },
  { title: '同城急送', desc: '同城配送及时达', color: '#ff9f0a', bg: '#fff5e6', icon: '送', url: '/pages/moving/index' },
  { title: '订酒店', desc: '最高立减100元券包', color: '#08a9ae', bg: '#ebffff', icon: '店' },
  { title: '看电影', desc: '全国享超低折扣看电影', color: '#ff4f68', bg: '#fff0f3', icon: '影' },
]

const go = (url) => {
  if (url) uni.navigateTo({ url })
}
</script>

<style>
page {
  background: #f4f9fd;
}

.life-page {
  min-height: 100vh;
  padding-bottom: calc(112rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #edf6ff 0%, #f8fcff 70%, #f8fcff 100%);
  color: #2d2f34;
}

.hero {
  height: 336rpx;
  padding: calc(var(--status-bar-height) + 44rpx) 30rpx 0;
  background: linear-gradient(135deg, #4a82ff 0%, #76a5ff 43%, #2de0b7 100%);
  box-sizing: border-box;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  padding-left: 24rpx;
  color: #ffffff;
  font-size: 44rpx;
  line-height: 64rpx;
}

.capsule {
  width: 174rpx;
  height: 64rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.62);
  box-sizing: border-box;
}

.capsule-line {
  width: 1rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.18);
}

.capsule-circle {
  width: 42rpx;
  height: 42rpx;
  border: 8rpx solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
}

.content {
  margin-top: -130rpx;
  padding: 0 30rpx 30rpx;
}

.video-card,
.welfare-card {
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.video-card {
  min-height: 240rpx;
  padding: 36rpx 32rpx 34rpx;
}

.section-title-wrap {
  width: 150rpx;
  height: 52rpx;
  position: relative;
}

.section-title {
  position: relative;
  z-index: 2;
  color: #2d2f34;
  font-size: 34rpx;
  font-weight: 700;
}

.section-underline {
  position: absolute;
  left: 0;
  bottom: 8rpx;
  width: 126rpx;
  height: 5rpx;
  background: #4586ff;
}

.title-mark {
  position: absolute;
  left: 72rpx;
  bottom: -6rpx;
  width: 30rpx;
  height: 20rpx;
  border: 5rpx solid #4586ff;
  border-top: none;
  border-left-color: transparent;
  border-radius: 0 0 22rpx 22rpx;
  transform: rotate(-17deg);
}

.video-row {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
}

.play-box {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: #eefbf6;
}

.play-icon {
  width: 0;
  height: 0;
  margin-left: 6rpx;
  border-top: 18rpx solid transparent;
  border-bottom: 18rpx solid transparent;
  border-left: 28rpx solid #46d366;
}

.video-text {
  flex: 1;
  margin-left: 18rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.finish-btn {
  width: 144rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 34rpx;
  background: #5c94ff;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 700;
}

.welfare-card {
  margin-top: 24rpx;
  padding: 36rpx 32rpx 70rpx;
}

.service-grid {
  margin-top: 38rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 34rpx 14rpx;
}

.service-item {
  height: 218rpx;
  padding-top: 34rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 14rpx;
  box-sizing: border-box;
}

.service-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 800;
}

.service-title {
  margin-top: 20rpx;
  color: #2d2f34;
  font-size: 29rpx;
}

.service-desc {
  width: 100%;
  margin-top: 6rpx;
  overflow: hidden;
  color: #ff5a00;
  font-size: 20rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
