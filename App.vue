<script>
import { installAuthNavigationGuard } from './services/auth'
import { API_BASE_URL, debugLog } from './services/request'

export default {
  onLaunch() {
    debugLog('info', 'app:onLaunch', {
      time: new Date().toISOString(),
      apiBaseURL: API_BASE_URL,
    })
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
