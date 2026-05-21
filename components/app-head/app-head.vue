<template>
  <view class="app-head" :style="{ backgroundColor }">
    <view class="app-head__bar">
      <view class="app-head__side app-head__left">
        <slot name="left">
          <view v-if="showBack" class="app-head__icon" @tap="handleBack">
            <text class="app-head__back" :style="{ color: iconColor, fontSize: `${iconSize * 2}rpx` }">‹</text>
          </view>
        </slot>
      </view>

      <text class="app-head__title" :style="{ color: titleColor }">{{ title }}</text>

      <view class="app-head__side app-head__right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { back } from '@/utils/router'

defineProps({
  title: {
    type: String,
    default: '',
  },
  showBack: {
    type: Boolean,
    default: false,
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  titleColor: {
    type: String,
    default: '#1f2937',
  },
  iconColor: {
    type: String,
    default: '#1f2937',
  },
  iconSize: {
    type: [String, Number],
    default: 21,
  },
})

const handleBack = () => {
  back()
}
</script>

<style scoped>
.app-head {
  position: relative;
  z-index: 10;
  width: 100%;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
}

.app-head__bar {
  height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.app-head__side {
  width: 136rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
}

.app-head__left {
  justify-content: flex-start;
}

.app-head__right {
  justify-content: flex-end;
}

.app-head__icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}

.app-head__back {
  font-weight: 700;
  line-height: 64rpx;
}

.app-head__title {
  flex: 1;
  overflow: hidden;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 88rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
