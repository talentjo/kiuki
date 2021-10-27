<template>
  <select
    class="selectInput"
    :class="{ 'selectInput--fullWidth': fullWidth }"
    size="10"
    @change="$emit('input', $event.target.value)">
    <option
      value=""
      disabled
      selected>
      Select collection
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value">
      {{ option.name }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    options: Array,
    fullWidth: Boolean
  }
}
</script>

<style lang="stylus">
.selectInput
  position relative
  border none
  background #fff
  min-width 300px
  margin 10px 0
  border 2px solid rgba(0, 0, 0, .1)
  padding-left 10px
  display flex
  font inherit
  &:disabled
    color #777
  &--fullWidth
    width 100%
</style>
