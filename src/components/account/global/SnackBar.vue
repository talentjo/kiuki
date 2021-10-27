<template>
  <div
    class="snackBar"
    :style="{ bottom: bottom + 'px' }">
    {{ message }}
    <i class="fal fa-exclamation-circle" />
  </div>
</template>

<script>
import { setTimeout } from 'timers'

export default {
  name: 'SnackBar',
  data () {
    return {
      message: '',
      bottom: -150,
      hideTime: 2300
    }
  },
  methods: {
    show (message) {
      this.message = message
      this.bottom = 20
      setTimeout(() => {
        this.hide()
      }, this.hideTime)
    },
    hide () {
      this.bottom = -150
    }
  }
}
</script>

<style lang="stylus" scoped>
.snackBar
  position fixed
  margin 0 auto
  left 0
  right 0
  width 300px
  border-radius 5px
  background-color #fff
  color red
  text-align center
  padding 12px 23px
  box-shadow 0 0 12px rgba(125, 0, 0, .2)
  z-index 999
  transition-duration .2s
</style>
