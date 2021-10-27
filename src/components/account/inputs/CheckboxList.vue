<template>
  <div class="checkboxList">
    <div
      v-for="checkbox in data"
      :key="checkbox[0]"
      class="checkboxList__checkbox">
      <input
        v-model="objectValues[checkbox[0]]"
        type="checkbox">
      <span>{{ checkbox[1] }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckboxList',
  props: {
    value: Array,
    data: Array
  },
  data () {
    return {
      objectValues: {}
    }
  },
  watch: {
    value (newValue) {
      this.objectValues = {}
      for (const value of newValue) {
        this.objectValues[value] = true
      }
    },
    objectValues (newValues) {
      const output = []
      for (const [key, value] of Object.entries(newValues)) {
        if (value === true) {
          output.push(key)
        }
      }
      this.$emit('input', output)
    }
  }
}
</script>

<style scoped lang="stylus">
.checkboxList
  display grid
  grid-template 1fr / 1fr 1fr auto
  text-align left
  &__checkbox
    margin-top 6px
    margin-right 16px
    span
      margin-right 4px
@media screen and (max-width: 780px)
  .checkboxList
    grid-template 1fr / 1fr 1fr
@media screen and (max-width: 560px)
  .checkboxList
    grid-template 1fr / 1fr
</style>
