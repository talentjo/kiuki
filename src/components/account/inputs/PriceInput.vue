<template>
  <currency-input
    locale="en-GB"
    :currency="currency"
    class="priceInput"
    :value="valueInMajorUnits"
    :placeholder="placeholder"
    @input="emitValue" />
</template>

<script>
import currencyList from '@/assets/currencyList.json'

export default {
  name: 'PriceInput',
  props: {
    currency: String,
    placeholder: String,
    value: Number
  },
  data () {
    return {
      currencyList
    }
  },
  computed: {
    valueInMajorUnits () {
      return (
        this.value / Math.pow(10, this.currencyList[this.currency].fractionSize)
      )
    }
  },
  methods: {
    emitValue (value) {
      this.$emit(
        'input',
        Math.round(
          value * Math.pow(10, this.currencyList[this.currency].fractionSize)
        )
      )
    }
  }
}
</script>

<style lang="stylus">
.priceInput
  position relative
  border none
  background #fff
  min-width 240px
  margin 0 10px
  border 2px solid rgba(0, 0, 0, .1)
  height 42px
  padding-left 10px
  display flex
  font inherit
  transition border-color 0.3s
  &:focus
    border-color dodgerblue
  &:disabled
    color #777
</style>
