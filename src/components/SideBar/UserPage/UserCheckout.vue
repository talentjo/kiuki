<template>
  <div class="userCheckout" />
</template>

<script>
import Feather from 'feather-icons'

export default {
  name: 'UserCheckout',
  data () {
    return {}
  },
  mounted () {
    Feather.replace()
  },
  updated () {
    Feather.replace()
  }
}
</script>

<style scoped lang="stylus">
.userCheckout
  display block
</style>
