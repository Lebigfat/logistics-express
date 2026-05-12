<template>
  <view class="uv-grid" :style="{ gridTemplateColumns }">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'UvGrid',
  props: {
    col: {
      type: [String, Number],
      default: 4,
    },
    border: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    gridTemplateColumns() {
      return `repeat(${Number(this.col) || 4}, 1fr)`
    },
  },
}
</script>

<style>
.uv-grid {
  display: grid;
  width: 100%;
}
</style>
