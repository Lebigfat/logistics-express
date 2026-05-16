<template>
  <view class="profile-page" style="min-height: 100vh; background: #f5fbff;">
    <view class="hero" style="height: 388rpx; position: relative; z-index: 1; background: linear-gradient(135deg, #b9cdfb 0%, #d9eff8 54%, #c5f3de 100%);">
    

      <view class="user-row" style="margin-top: 36rpx; padding-left: 28rpx; display: flex; align-items: center;">
        <view class="avatar-wrap" style="width: 120rpx; height: 136rpx; position: relative;">
          <view class="avatar" style="width: 120rpx; height: 120rpx; overflow: hidden; position: relative; border-radius: 50%; background: #c6c6c6;">
            <view class="avatar-head" style="position: absolute; left: 38rpx; top: 32rpx; width: 42rpx; height: 42rpx; border-radius: 50%; background: #f4f4f4;"></view>
            <view class="avatar-body" style="position: absolute; left: 24rpx; bottom: -12rpx; width: 72rpx; height: 54rpx; border-radius: 42rpx 42rpx 0 0; background: #f4f4f4;"></view>
          </view>
          <view class="sync-tag" style="position: absolute; left: 10rpx; bottom: 0; height: 26rpx; padding: 0 8rpx; border-radius: 14rpx; background: #f4cf91; color: #8e5a16; font-size: 18rpx; line-height: 26rpx;">同步头像C</view>
        </view>
        <view class="user-info" style="flex: 1; margin-left: 20rpx;">
          <text class="user-name" style="display: block; color: #333438; font-size: 32rpx; font-weight: 700; line-height: 44rpx;">微信用户...</text>
          <view class="invite-row" style="margin-top: 20rpx; display: flex; align-items: center;">
            <text class="invite-text" style="color: #96989c; font-size: 24rpx; line-height: 34rpx;">邀请码:103794242</text>
            <view class="copy-btn" style="height: 34rpx; margin-left: 10rpx; padding: 0 8rpx; display: flex; align-items: center; border: 2rpx solid #9a9a9a; border-radius: 8rpx; color: #8f9296; font-size: 24rpx; line-height: 30rpx;">复制</view>
          </view>
        </view>
      </view>
    </view>

    <view class="content" style="position: relative; z-index: 2; margin-top: -30rpx; padding: 0 30rpx 112rpx;">
      <view class="quick-card" style="height: 198rpx; padding: 30rpx 24rpx 18rpx; display: flex; justify-content: space-between; background: #ffffff; border-radius: 14rpx;">
        <view
          v-for="item in quickItems"
          :key="item.title"
          class="quick-item"
          style="width: 150rpx; display: flex; flex-direction: column; align-items: center;"
          @tap="handleQuickTap(item)"
        >
          <view class="quick-icon" style="width: 62rpx; height: 62rpx; display: flex; align-items: center; justify-content: center; color: #000000; font-size: 35rpx;">
            <text>{{ item.icon }}</text>
          </view>
          <text class="quick-title" style="margin-top: 18rpx; color: #2c2d30; font-size: 25rpx; line-height: 34rpx;">{{ item.title }}</text>
        </view>
      </view>

      <view class="invite-banner" style="height: 96rpx; margin-top: 24rpx; padding: 0 22rpx 0 26rpx; display: flex; align-items: center; background: #eaded7; border-radius: 12rpx;">
        <text class="invite-copy" style="flex: 1; color: #8d541d; font-size: 27rpx; line-height: 38rpx;">邀请好友下单升级，立享更多折扣</text>
        <view class="partner-btn" style="width: 208rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border-radius: 34rpx; background: #0d0d0d; color: #ffffff; font-size: 24rpx; font-weight: 700;">查询合伙人权益</view>
      </view>

      <view class="wallet-card" style="height: 240rpx; margin-top: 24rpx; padding: 34rpx 34rpx 0; background: #ffffff; border-radius: 14rpx;">
        <view class="card-head" style="display: flex; align-items: center; justify-content: space-between;">
          <text class="card-title" style="color: #2d2f34; font-size: 32rpx; font-weight: 700; line-height: 44rpx;">我的钱包</text>
          <view class="detail-link" style="display: flex; align-items: center; color: #9a9a9a; font-size: 25rpx;">
            <text>查看明细</text>
            <UvIcon name="arrow-right" color="#9a9a9a" size="20"></UvIcon>
          </view>
        </view>
        <view class="wallet-row" style="margin-top: 42rpx; display: flex; align-items: center;">
          <view v-for="item in walletItems" :key="item.label" class="wallet-item" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
            <text class="wallet-value" style="color: #2d2f34; font-size: 32rpx; line-height: 40rpx;">{{ item.value }}</text>
            <text class="wallet-label" style="margin-top: 18rpx; color: #9b9b9b; font-size: 24rpx; line-height: 32rpx;">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="function-card" style="margin-top: 24rpx; padding: 36rpx 34rpx 22rpx; background: #ffffff; border-radius: 14rpx;">
        <text class="card-title" style="color: #2d2f34; font-size: 32rpx; font-weight: 700; line-height: 44rpx;">我的功能</text>
        <view class="function-grid" style="margin-top: 34rpx; display: flex; flex-wrap: wrap; justify-content: space-between;">
          <view v-for="item in functionItems" :key="item.title" class="function-item" style="width: 150rpx; height: 122rpx; margin-bottom: 28rpx; display: flex; flex-direction: column; align-items: center;">
            <view class="function-icon" style="width: 58rpx; height: 58rpx; display: flex; align-items: center; justify-content: center; border: 4rpx solid #000000; border-radius: 12rpx; color: #000000; font-size: 28rpx;">
              <text>{{ item.icon }}</text>
            </view>
            <text class="function-title" style="margin-top: 16rpx; color: #2c2d30; font-size: 24rpx; line-height: 34rpx;">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import UvIcon from '@/components/uv-icon/uv-icon.vue'

const quickItems = [
  { title: '优惠券', icon: '券', url: '/pages/coupon/index' },
  { title: '地址管理', icon: '○', url: '/pages/address/index' },
  { title: '费用补缴', icon: '￥' },
  { title: '邀请好友', icon: '信' },
]

const handleQuickTap = (item) => {
  if (!item.url) {
    return
  }

  uni.navigateTo({
    url: item.url,
  })
}

const walletItems = [
  { label: '余额', value: '0' },
  { label: '待入账', value: '0' },
  { label: '体现次数', value: '0' },
]

const functionItems = [
  { title: '余额提现', icon: '▭' },
  { title: '团队列表', icon: '☰' },
  { title: '佣金规则', icon: '?' },
  { title: '填写邀请码', icon: '▤' },
  { title: '团队订单', icon: '▤' },
  { title: '搜索上级', icon: '⌕' },
  { title: '设置', icon: '◇' },
  { title: '联系客服', icon: '●' },
]
</script>

<style>
page {
  background: #f5fbff;
}

.profile-page {
  min-height: 100vh;
  padding-bottom: 34rpx;
  background: #f5fbff;
  color: #2c2d30;
  box-sizing: border-box;
}

.hero {
  height: 388rpx;
  position: relative;
  z-index: 1;
  padding: 92rpx 30rpx 0;
  background: linear-gradient(135deg, #b9cdfb 0%, #d9eff8 54%, #c5f3de 100%);
  box-sizing: border-box;
}

.capsule {
  width: 174rpx;
  height: 64rpx;
  margin-left: auto;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 34rpx;
  background: #eaf8f5;
  box-sizing: border-box;
}

.capsule-line {
  width: 1rpx;
  height: 36rpx;
  background: #b8c8c6;
}

.capsule-circle {
  width: 42rpx;
  height: 42rpx;
  border: 8rpx solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
}

.user-row {
  margin-top: 36rpx;
  padding-left: 28rpx;
  display: flex;
  align-items: center;
}

.avatar-wrap {
  width: 120rpx;
  height: 136rpx;
  position: relative;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  overflow: hidden;
  position: relative;
  border: 2rpx solid #ffffff;
  border-radius: 50%;
  background: #c6c6c6;
  box-sizing: border-box;
}

.avatar-head {
  position: absolute;
  left: 38rpx;
  top: 32rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #f4f4f4;
}

.avatar-body {
  position: absolute;
  left: 24rpx;
  bottom: -12rpx;
  width: 72rpx;
  height: 54rpx;
  border-radius: 42rpx 42rpx 0 0;
  background: #f4f4f4;
}

.sync-tag {
  position: absolute;
  left: 10rpx;
  bottom: 0;
  height: 26rpx;
  padding: 0 8rpx;
  border-radius: 14rpx;
  background: #f4cf91;
  color: #8e5a16;
  font-size: 18rpx;
  line-height: 26rpx;
}

.user-info {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.user-name {
  display: block;
  color: #333438;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.invite-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
}

.invite-text {
  color: #96989c;
  font-size: 24rpx;
  line-height: 34rpx;
}

.copy-btn {
  height: 34rpx;
  margin-left: 10rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid #9a9a9a;
  border-radius: 8rpx;
  color: #8f9296;
  font-size: 24rpx;
  line-height: 30rpx;
  box-sizing: border-box;
}

.content {
  position: relative;
  z-index: 2;
  margin-top: -30rpx;
  padding: 0 30rpx 112rpx;
  box-sizing: border-box;
}

.quick-card,
.wallet-card,
.function-card {
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.quick-card {
  height: 198rpx;
  padding: 30rpx 24rpx 18rpx;
  display: flex;
  justify-content: space-between;
}

.quick-item {
  width: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-icon,
.function-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-weight: 500;
}

.quick-icon {
  width: 62rpx;
  height: 62rpx;
  font-size: 35rpx;
}

.quick-title {
  margin-top: 18rpx;
  color: #2c2d30;
  font-size: 25rpx;
  line-height: 34rpx;
}

.invite-banner {
  height: 96rpx;
  margin-top: 24rpx;
  padding: 0 22rpx 0 26rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background: #eaded7;
  box-sizing: border-box;
}

.invite-copy {
  flex: 1;
  min-width: 0;
  color: #8d541d;
  font-size: 27rpx;
  line-height: 38rpx;
  white-space: nowrap;
}

.partner-btn {
  width: 208rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 34rpx;
  background: #0d0d0d;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}

.wallet-card {
  height: 240rpx;
  margin-top: 24rpx;
  padding: 34rpx 34rpx 0;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  color: #2d2f34;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.detail-link {
  display: flex;
  align-items: center;
  color: #9a9a9a;
  font-size: 25rpx;
}

.wallet-row {
  margin-top: 42rpx;
  display: flex;
  align-items: center;
}

.wallet-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wallet-value {
  color: #2d2f34;
  font-size: 32rpx;
  line-height: 40rpx;
}

.wallet-label {
  margin-top: 18rpx;
  color: #9b9b9b;
  font-size: 24rpx;
  line-height: 32rpx;
}

.function-card {
  margin-top: 24rpx;
  padding: 36rpx 34rpx 22rpx;
}

.function-grid {
  margin-top: 34rpx;
  display: flex;
  justify-content: space-between;
}

.function-grid {
  flex-wrap: wrap;
}

.function-item {
  width: 150rpx;
  height: 122rpx;
  margin-bottom: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-icon {
  width: 58rpx;
  height: 58rpx;
  border: 4rpx solid #000000;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 58rpx;
  box-sizing: border-box;
}

.function-title {
  margin-top: 16rpx;
  color: #2c2d30;
  font-size: 24rpx;
  line-height: 34rpx;
}
</style>
