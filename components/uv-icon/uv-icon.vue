<template>
  <text
    class="uv-icon"
    :class="{ bold }"
    :style="{ color, fontSize: iconSize }"
  >{{ iconText }}</text>
</template>

<script>
const icons = {
  scan: '□',
  search: '⌕',
  'arrow-upward': '↑',
  'arrow-right': '›',
  car: '▣',
  map: '◆',
  gift: '◇',
  'shopping-cart': '▤',
  'red-packet': '￥',
  coupon: '券',
  'file-text': '▦',
  'edit-pen': '✎',
  'volume-fill': '●',
  close: '×',
  'map-fill': '◆',
  'arrow-left': '‹',
  'more-dot-fill': '⋯',
  checkmark: '✓',
}

export default {
  name: 'UvIcon',
  props: {
    name: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#333333',
    },
    size: {
      type: [String, Number],
      default: 16,
    },
    bold: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconText() {
      return icons[this.name] || '•'
    },
    iconSize() {
      return `${this.size}px`
    },
  },
}
</script>

<style>
.uv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.uv-icon.bold {
  font-weight: 700;
}
</style>
