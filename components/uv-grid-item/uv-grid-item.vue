<template>
  <view class="uv-grid-item">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'UvGridItem',
  props: {
    name: {
      type: [String, Number],
      default: '',
    },
  },
}
</script>

<style>
.uv-grid-item {
  min-width: 0;
}
</style>
