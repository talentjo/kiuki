<template>
  <button
    class="whiteButton"
    :disabled="disabled">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'WhiteButton',
  props: {
    disabled: Boolean
  }
}
</script>

<style scoped lang="stylus">
.whiteButton
  min-width 150px
  padding 0 12px
  height 32px
  border none
  background-color white
  box-shadow 0 2px 8px rgba(0, 0, 0, .08)
  cursor pointer
  font inherit
  font-size 14px
  color black
  transition background-color .1s, transform .12s
  p, b
    margin 0
    padding 0
  &:hover
    background-color #fcfcfc
    transform scale(1.03)
  &[selected]
    box-shadow 0 0 4px 1px dodgerblue
    color dodgerblue
    i
      color dodgerblue
  &[disabled]
    opacity .4
    cursor default
    &:hover
      opacity .4
</style>
