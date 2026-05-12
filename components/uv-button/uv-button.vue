<template>
  <button
    class="uv-button"
    :class="[type, shape]"
    :style="customStyle"
    @tap="$emit('click')"
  >
    <text :style="customTextStyle">{{ text }}</text>
  </button>
</template>

<script>
export default {
  name: 'UvButton',
  props: {
    text: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'default',
    },
    shape: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customTextStyle: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style>
.uv-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: #ffffff;
  background: #438bff;
  line-height: 1;
}

.uv-button::after {
  border: 0;
}

.uv-button.circle {
  border-radius: 999px;
}
</style>
