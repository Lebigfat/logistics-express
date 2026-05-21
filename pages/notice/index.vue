<template>
  <view class="page">
    <AppHead title="公告详情" show-back></AppHead>
    <view class="card">
      <text class="title">{{ detail.desc || '公告' }}</text>
      <text class="time">{{ timeText(detail.updatetime || detail.createtime) }}</text>
      <rich-text class="content" :nodes="detail.content || '暂无内容'"></rich-text>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AppHead from '@/components/app-head/app-head.vue'
import { userApi } from '@/services/api'
import { timeText } from '@/utils/api-fields'

const detail = ref({})

onLoad(async (options = {}) => {
  if (!options.id) return
  try {
    detail.value = await userApi.getNoticeDetail(options.id)
  } catch (error) {
    uni.showToast({ title: error.message || '公告加载失败', icon: 'none' })
  }
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

.card {
  margin: 24rpx 30rpx;
  padding: 30rpx;
  border-radius: 14rpx;
  background: #ffffff;
}

.title {
  display: block;
  color: #111827;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 46rpx;
}

.time {
  display: block;
  margin-top: 14rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.content {
  display: block;
  margin-top: 28rpx;
  color: #4b5563;
  font-size: 28rpx;
  line-height: 44rpx;
}
</style>
