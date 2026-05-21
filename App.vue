<script>
import { installAuthNavigationGuard } from './services/auth'

export default {
  onLaunch() {
    installAuthNavigationGuard()
  },
}
</script>

<style lang="scss">
page,
view,
text,
image,
scroll-view,
input,
textarea,
button {
  box-sizing: border-box;
}

page {
  width: 100%;
  min-height: 100%;
  font-size: 28rpx;
}

button::after {
  border: none;
}
</style>
