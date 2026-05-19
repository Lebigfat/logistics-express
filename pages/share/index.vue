<template>
  <view class="share-page">
    <view class="hero">
      <AppHead title="分享赚佣金" show-back background-color="transparent" title-color="#ffffff" icon-color="#ffffff"></AppHead>
      <view class="hero-copy">
        <text>寄件省钱</text>
        <text>还返佣</text>
        <view>人人都在分享赚钱</view>
      </view>
      <view class="courier-man">📦</view>
    </view>

    <view class="content">
      <view class="steps-card">
        <view class="steps-row">
          <view class="step-item"><view>↗</view><text>①分享好友</text></view>
          <text class="arrow">→</text>
          <view class="step-item"><view>□</view><text>②好友寄件</text></view>
          <text class="arrow">→</text>
          <view class="step-item orange"><view>¥</view><text>③获取佣金</text></view>
        </view>
        <view class="share-btn" @tap="share">去分享</view>
        <view class="news-row">
          <view class="avatar"></view>
          <text>恭喜【感恩A】近30日推广获得佣金5635.35元</text>
        </view>
      </view>

      <view class="promo-card">
        <view class="card-head">
          <text>我的推广</text>
          <text class="withdraw">提现 ></text>
        </view>
        <view class="data-row">
          <view><text>累计客户</text><strong>0人</strong><text>本月客户0人</text></view>
          <view><text>累计入账佣金</text><strong>0元</strong><text>待入账（近30天）</text></view>
        </view>
      </view>

      <view class="adv-card">
        <text class="card-tab">产品优势</text>
        <view class="adv-grid">
          <view v-for="item in advantages" :key="item.title" class="adv-item">
            <view>{{ item.icon }}</view>
            <text>{{ item.title }}</text>
            <small>{{ item.desc }}</small>
          </view>
        </view>
      </view>

      <view class="rule-card">
        <text class="card-tab">分享返佣细则</text>
        <view class="rule-text">
          <text class="rule-title">分享方式：</text>
          <text>点击“邀请好友”将小程序分享给微信好友或微信群；点击“生成海报”后，会生成带有您账号标识的专属太阳码海报。</text>
          <text class="rule-title">返佣规则：</text>
          <text>被邀请人在本平台寄件下单后，符合平台要求的订单将按规则计算佣金；超重未补缴运费、第三方跳转订单不参与返佣。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const advantages = [
  { title: '收益丰厚', desc: '分享后即绑定关系下单后有收益', icon: '¥' },
  { title: '价格优势', desc: '支持主流快递公司价格低于市场价', icon: '↗' },
  { title: '拉新补贴', desc: '平台千万资金扶持新用户首单补贴', icon: '▣' },
]

const share = () => {
  uni.showToast({ title: '已生成分享邀请', icon: 'none' })
}
</script>

<style>
page {
  background: #f2f3f6;
}

.share-page {
  min-height: 100vh;
  background: #f2f3f6;
}

.hero {
  height: 690rpx;
  position: relative;
  background: linear-gradient(135deg, #4e86ff 0%, #94c6ef 56%, #2fd7b8 100%);
}

.hero-copy {
  padding: 34rpx 64rpx 0;
  color: #ffffff;
}

.hero-copy text {
  display: block;
  font-size: 76rpx;
  font-weight: 900;
  line-height: 100rpx;
}

.hero-copy view {
  width: 310rpx;
  height: 78rpx;
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #ff5a00;
  font-size: 34rpx;
  font-weight: 700;
}

.courier-man {
  position: absolute;
  right: 70rpx;
  top: 230rpx;
  font-size: 142rpx;
}

.content {
  margin-top: -194rpx;
  padding: 0 30rpx 46rpx;
  position: relative;
  z-index: 2;
}

.steps-card,
.promo-card,
.adv-card,
.rule-card {
  margin-bottom: 24rpx;
  padding: 34rpx 30rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.steps-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333333;
  font-size: 29rpx;
}

.step-item view {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #4b8dff;
  color: #ffffff;
  font-size: 42rpx;
  font-weight: 800;
}

.step-item.orange view {
  background: #ff7a1a;
}

.arrow {
  color: #c2c6cf;
  font-size: 56rpx;
}

.share-btn {
  height: 86rpx;
  margin-top: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 46rpx;
  background: #4b8dff;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.news-row {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  color: #555555;
  font-size: 25rpx;
}

.avatar {
  width: 44rpx;
  height: 44rpx;
  margin-right: 14rpx;
  border-radius: 50%;
  background: #c8d6eb;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 31rpx;
  font-weight: 700;
}

.withdraw {
  color: #438bff;
  font-weight: 500;
}

.data-row {
  margin-top: 34rpx;
  padding-top: 34rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1rpx solid #edf0f5;
}

.data-row view {
  display: flex;
  flex-direction: column;
  color: #999999;
  font-size: 26rpx;
}

.data-row strong {
  margin: 34rpx 0 22rpx;
  color: #333333;
  font-size: 36rpx;
}

.card-tab {
  width: 264rpx;
  height: 72rpx;
  margin: -34rpx auto 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 36rpx 36rpx;
  background: #e8f0ff;
  color: #438bff;
  font-size: 31rpx;
  font-weight: 700;
}

.adv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.adv-item {
  min-height: 264rpx;
  padding: 34rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12rpx;
  background: #fff6ea;
  color: #ff6400;
  text-align: center;
  box-sizing: border-box;
}

.adv-item view {
  font-size: 48rpx;
}

.adv-item text {
  margin-top: 22rpx;
  font-size: 31rpx;
  font-weight: 700;
}

.adv-item small {
  margin-top: 18rpx;
  font-size: 22rpx;
  line-height: 34rpx;
}

.rule-text text {
  display: block;
  color: #666666;
  font-size: 30rpx;
  line-height: 54rpx;
}

.rule-text .rule-title {
  margin-top: 26rpx;
  color: #333333;
  font-weight: 700;
}
</style>
