<script>
import { installAuthNavigationGuard } from './services/auth'

export default {
  onLaunch() {
    installAuthNavigationGuard()
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/* 每个页面公共 CSS */
</style>
