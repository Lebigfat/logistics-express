<template>
  <view class="page">
    <view class="hero">
      <view class="status-space"></view>
      <view class="brand-row">
        <text class="brand">寄速递</text>
      
      </view>

        <view class="search-wrap">
        
        <view class="search-box">
          <u-icon name="scan" color="#4b8dff" size="22"></u-icon>
          <view class="search-divider"></view>
          <text class="search-placeholder">输入要查询的单号或扫码单号</text>
          <u-icon name="search" color="#333333" size="22"></u-icon>
        </view>
      </view>

      <view class="quick-panel">
        <view class="primary-card" @tap="goSend">
          <view class="quick-main">
            <view class="send-icon">
              <u-icon name="arrow-upward" color="#ffffff" size="25" bold></u-icon>
            </view>
            <view class="quick-text">
              <text class="quick-title">寄快递</text>
              <text class="quick-desc">寄全国 5元起</text>
            </view>
          </view>

          <view class="ai-area">
            <view class="ai-chip">
              <text>AI自动全网比价</text>
              <u-icon name="arrow-right" color="#ffffff" size="14"></u-icon>
            </view>
            <view class="brand-dots">
              <text
                v-for="item in courierDots"
                :key="item.name"
                class="brand-dot"
                :style="{ backgroundColor: item.color }"
              >
                {{ item.name }}
              </text>
            </view>
          </view>
        </view>

        <view class="side-actions">
          <view class="side-card" v-for="item in topActions" :key="item.title">
            <view class="side-icon" :class="item.iconClass">
              <u-icon :name="item.icon" color="#ffffff" size="25"></u-icon>
            </view>
            <view class="side-copy">
              <text class="side-title">{{ item.title }}</text>
              <text class="side-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="main">
      <view class="tool-grid">
        <u-grid col="4" :border="false">
          <u-grid-item v-for="item in tools" :key="item.title" :name="item.title">
            <view class="tool-item">
              <view class="tool-badge" v-if="item.badge">{{ item.badge }}</view>
              <view class="tool-icon" :class="item.iconClass">
                <u-icon :name="item.icon" color="#ffffff" size="18"></u-icon>
              </view>
              <text>{{ item.title }}</text>
            </view>
          </u-grid-item>
        </u-grid>
      </view>

      <view class="notice-card">
        <view class="notice-icon">
          <u-icon name="volume-fill" color="#ffffff" size="16"></u-icon>
        </view>
        <text class="notice-text">恭喜李某某获得3.76元奖励，</text>
        <text class="notice-link">点击分享返佣</text>
      </view>

      <view class="promo-banner">
        <view class="promo-copy">
          <text class="promo-tag">当天上门</text>
          <text class="promo-title">寄件就用寄速递</text>
          <view class="promo-row">
            <text>全国低至</text>
            <text class="promo-price">5元起!</text>
          </view>
        </view>
        <view class="pin-wrap">
          <u-icon name="map-fill" color="#ff604b" size="28"></u-icon>
        </view>
        <view class="parcel-art">
          <view class="parcel parcel-a"></view>
          <view class="parcel parcel-b"></view>
          <view class="parcel parcel-c"></view>
          <view class="parcel parcel-d"></view>
          <view class="list-card">
            <view></view>
            <view></view>
            <view></view>
          </view>
        </view>
      </view>

      <view class="follow-bar">
        <view class="close">
          <u-icon name="close" color="#ffffff" size="13"></u-icon>
        </view>
        <text class="follow-text">关注公众号，领优惠券再加平台返利</text>
        <u-button
          text="去关注"
          type="primary"
          shape="circle"
          size="mini"
          color="#438bff"
          :custom-style="followButtonStyle"
          :custom-text-style="followButtonTextStyle"
        ></u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
const followButtonStyle = {
  width: '96rpx',
  height: '40rpx',
  margin: 0,
  padding: 0,
}

const followButtonTextStyle = {
  fontSize: '20rpx',
  lineHeight: '40rpx',
}

const courierDots = [
  { name: 'Y', color: '#5b2b74' },
  { name: 'S', color: '#ffb100' },
  { name: 'Z', color: '#1ea9ff' },
  { name: 'T', color: '#7b7b7b' },
  { name: 'C', color: '#0077ff' },
  { name: 'J', color: '#f23b3b' },
  { name: 'D', color: '#ff4d40' },
]

const topActions = [
  { title: '寄大件', desc: '30公斤起重货邮寄', icon: 'car', iconClass: 'blue' },
  { title: '同城送货', desc: '同城跨城都便宜', icon: 'map', iconClass: 'green' },
]

const tools = [
  { title: '查运费', icon: 'search', iconClass: 'cyan' },
  { title: '同城闪送', icon: 'car', iconClass: 'blue' },
  { title: '寄冷链', icon: 'gift', iconClass: 'green' },
  { title: '商家寄件', icon: 'shopping-cart', iconClass: 'blue' },
  { title: '分享返佣', icon: 'red-packet', iconClass: 'cyan', badge: '去赚钱' },
  { title: '费用补贴', icon: 'coupon', iconClass: 'blue' },
  { title: '批量寄件', icon: 'file-text', iconClass: 'green' },
  { title: '意见反馈', icon: 'edit-pen', iconClass: 'blue' },
]

const goSend = () => {
  uni.navigateTo({
    url: '/pages/send/index',
  })
}
</script>

<style>
page {
  background: #f5f7fb;
}

.page {
  min-height: 100vh;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #17233d;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
}

.hero {
  padding: 0 36rpx 40rpx;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 68%, #ffffff 100%),
    radial-gradient(circle at -20% 6%, rgba(70, 129, 255, 0.98) 0%, rgba(91, 161, 246, 0.78) 38%, rgba(91, 161, 246, 0) 68%),
    radial-gradient(circle at 88% 6%, rgba(47, 220, 193, 0.98) 0%, rgba(87, 207, 218, 0.78) 38%, rgba(87, 207, 218, 0) 68%),
    linear-gradient(90deg, #4f86ff 0%, #63b6ee 50%, #35dcc0 100%);
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 132rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 86%);
  pointer-events: none;
}

.status-space {
  height: 86rpx;
}

.brand-row {
  height: 54rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.brand {
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 54rpx;
}

.search-wrap {
  height: 88rpx;
  margin-top: 22rpx;
  position: relative;
  z-index: 1;
  border-radius: 14rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(25, 74, 130, 0.08);
}

.search-box {
  height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.search-divider {
  width: 1rpx;
  height: 32rpx;
  margin: 0 18rpx;
  background: #e7eaf0;
}

.search-placeholder {
  flex: 1;
  color: #b8beca;
  font-size: 25rpx;
  line-height: 88rpx;
}

.quick-panel {
  margin-top: 30rpx;
  display: flex;
  position: relative;
  z-index: 1;
}

.primary-card,
.side-card,
.tool-grid,
.notice-card,
.promo-banner,
.follow-bar {
  box-sizing: border-box;
}

.primary-card {
  flex: 1;
  height: 308rpx;
  margin-right: 18rpx;
  overflow: hidden;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #5d99ff 0%, #4a73f5 100%);
  color: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(43, 104, 213, 0.12);
}

.quick-main {
  height: 140rpx;
  padding: 30rpx 24rpx 0;
  display: flex;
  box-sizing: border-box;
}

.send-icon {
  width: 78rpx;
  height: 78rpx;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.25);
}

.quick-text {
  padding-top: 4rpx;
}

.quick-title,
.quick-desc,
.side-title,
.side-desc,
.tool-item text,
.promo-tag,
.promo-title {
  display: block;
}

.quick-title {
  font-size: 31rpx;
  font-weight: 700;
}

.quick-desc {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 22rpx;
}

.ai-area {
  height: 168rpx;
  padding: 22rpx 24rpx 20rpx;
  background: rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
}

.ai-chip {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 27rpx;
  font-weight: 500;
}

.brand-dots {
  margin-top: 24rpx;
  display: flex;
}

.brand-dot {
  width: 28rpx;
  height: 28rpx;
  margin-right: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 14rpx;
  font-weight: 700;
}

.side-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.side-card {
  height: 146rpx;
  padding: 32rpx 26rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(25, 74, 130, 0.08);
}

.side-card + .side-card {
  margin-top: 16rpx;
}

.side-icon {
  width: 78rpx;
  height: 78rpx;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
}

.side-copy {
  flex: 1;
}

.side-title {
  color: #222b3d;
  font-size: 31rpx;
  font-weight: 700;
}

.side-desc {
  margin-top: 6rpx;
  color: #9aa4b5;
  font-size: 21rpx;
}

.main {
  margin-top: 0;
  padding: 0 36rpx;
  background: #ffffff;
}

.tool-grid {
  padding: 34rpx 4rpx 16rpx;
  border-radius: 14rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 28rpx rgba(25, 74, 130, 0.08);
}

.tool-item {
  min-height: 106rpx;
  margin-bottom: 24rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #3d4658;
  font-size: 21rpx;
}

.tool-icon {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
}

.tool-badge {
  position: absolute;
  top: -32rpx;
  right: -48rpx;
  height: 30rpx;
  padding: 0rpx 10rpx;
  border-radius: 18rpx 18rpx 18rpx 0;
  background: #ff6b35;
  color: #ffffff;
  font-size: 18rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.blue {
  background: linear-gradient(135deg, #6fa4ff, #4e83ff);
}

.green {
  background: linear-gradient(135deg, #7cebc8, #46d7ae);
}

.cyan {
  background: linear-gradient(135deg, #5ec9ff, #49b7ee);
}

.notice-card {
  height: 80rpx;
  margin-top: 28rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(25, 74, 130, 0.07);
  overflow: hidden;
}

.notice-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #5b8fff;
}

.notice-text,
.notice-link {
  font-size: 25rpx;
  line-height: 80rpx;
}

.notice-text {
  color: #4d5f76;
}

.notice-link {
  color: #2f80ff;
}

.promo-banner {
  height: 292rpx;
  margin-top: 28rpx;
  padding: 62rpx 54rpx;
  position: relative;
  overflow: hidden;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #d8ffe7 0%, #9ddfff 52%, #b9cfff 100%);
}

.promo-copy {
  position: relative;
  z-index: 2;
}

.promo-tag {
  width: 98rpx;
  height: 30rpx;
  border-radius: 18rpx;
  background: linear-gradient(90deg, #2e78ff, #42c5ff);
  color: #ffffff;
  font-size: 18rpx;
  line-height: 30rpx;
  text-align: center;
  font-weight: 700;
}

.promo-title {
  margin-top: 20rpx;
  color: #101820;
  font-size: 40rpx;
  font-weight: 800;
}

.promo-row {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  color: #101820;
  font-size: 20rpx;
  font-weight: 800;
}

.promo-price {
  margin-left: 4rpx;
  color: #ff4700;
  font-size: 26rpx;
}

.pin-wrap {
  position: absolute;
  right: 118rpx;
  top: 42rpx;
  z-index: 3;
}

.parcel-art {
  position: absolute;
  right: 24rpx;
  bottom: 28rpx;
  width: 260rpx;
  height: 180rpx;
}

.parcel {
  position: absolute;
  border-radius: 8rpx;
  background: #ffbd4a;
  box-shadow: inset 0 -8rpx 0 rgba(202, 111, 0, 0.18);
}

.parcel-a {
  right: 40rpx;
  bottom: 0;
  width: 92rpx;
  height: 98rpx;
}

.parcel-b {
  right: 118rpx;
  bottom: 0;
  width: 70rpx;
  height: 74rpx;
  background: #ffd26d;
}

.parcel-c {
  right: 8rpx;
  bottom: 8rpx;
  width: 60rpx;
  height: 58rpx;
  background: #ffc152;
}

.parcel-d {
  right: 70rpx;
  bottom: 92rpx;
  width: 58rpx;
  height: 56rpx;
  background: #f7a83a;
}

.list-card {
  position: absolute;
  left: 4rpx;
  bottom: 10rpx;
  width: 66rpx;
  height: 74rpx;
  padding: 12rpx 10rpx;
  border-radius: 10rpx;
  background: #ffffff;
  box-sizing: border-box;
  box-shadow: 0 8rpx 18rpx rgba(49, 104, 178, 0.15);
}

.list-card view {
  height: 8rpx;
  margin-bottom: 10rpx;
  border-radius: 8rpx;
  background: #4b8dff;
}

.follow-bar {
  height: 68rpx;
  margin-top: 28rpx;
  padding: 0 10rpx 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 34rpx;
  background: #666a6d;
  color: #ffffff;
}

.close {
  width: 34rpx;
  height: 34rpx;
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.follow-text {
  flex: 1;
  font-size: 23rpx;
}
</style>
