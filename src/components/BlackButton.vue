<template>
  <button
    :type="type"
    :style="{
      backgroundColor: inverted ? 'black' : 'white',
      border: borderLess || inverted ? 'none' : '1px solid #ddd',
      padding: borderLess ? '0' : '0 17px',
      color: inverted ? 'white !important' : 'black !important',
    }">
    <span v-if="loading">
      <i
        data-feather="loader"
        class="spin"
        style="height: 17px; padding: 0" />
    </span>
    <p v-else>
      <slot />
    </p>
  </button>
</template>

<script>
import Feather from 'feather-icons'

export default {
  name: 'BlackButton',
  props: {
    inverted: Boolean,
    borderLess: Boolean,
    loading: Boolean,
    type: String
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
button
  position relative
  display inline-flex
  align-items center
  justify-content center
  background-color white
  padding 0 17px
  font inherit
  height 32px
  min-width 80px
  font-size 14px
  cursor pointer
  transition-duration .12s
  span
    line-height 0
    margin 0
    color inherit !important
  p
    line-height 0
    margin 0
    color inherit !important
  &:hover
    border-color #aaa
    color #333
  &:active
    opacity .5
  &[disabled]
    cursor default
    border-color #ddd
    color black
    opacity .3
</style>
