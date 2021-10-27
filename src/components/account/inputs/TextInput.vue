<template>
  <input
    type="text"
    class="textInput"
    :class="{
      'textInput--fullWidth': fullWidth,
    }"
    :placeholder="placeholder"
    @input="$emit('input', $event.target.value)"
    @keyup.enter="$emit('enter', $event.target.value)">
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    placeholder: String,
    fullWidth: Boolean
  }
}
</script>

<style lang="stylus">
.textInput
  position relative
  border none
  background #fff
  min-width 240px
  margin 10px 0
  border 2px solid rgba(0, 0, 0, .1)
  height 34px
  padding-left 10px
  display flex
  font inherit
  transition border-color 0.3s
  &:focus
    border-color dodgerblue
  &:disabled
    color #777
  &--narrow
    min-width 130px
  &--wide
    min-width 620px
  &--fullWidth
    width 100%
</style>
