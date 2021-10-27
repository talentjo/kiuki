<template>
  <div
    class="numberInput"
    :class="{ 'numberInput--large': large }">
    <button
      v-if="!hideButtons"
      class="numberInput__minus"
      @click="decreaseValue">
      <i class="fal fa-minus" />
    </button>
    <input
      v-model.number="inputValue"
      :min="min"
      :max="max"
      :step="step"
      :style="{
        borderRadius: hideButtons ? '5px' : '0',
      }">
    <button
      v-if="!hideButtons"
      class="numberInput__plus"
      @click="increaseValue">
      <i class="fal fa-plus" />
    </button>
    <label :for="name"><slot /></label>
  </div>
</template>

<script>
export default {
  name: 'NumberInput',
  props: {
    name: String,
    value: Number,
    hideButtons: Boolean,
    min: {
      required: false,
      default: '0'
    },
    max: {
      required: false,
      default: '9999999999'
    },
    step: {
      required: false,
      default: '1'
    },
    large: {
      required: false,
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      inputValue: this.value
    }
  },
  watch: {
    value (newValue) {
      this.inputValue = newValue
    },
    inputValue (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    increaseValue () {
      if (this.inputValue + parseFloat(this.step) <= parseFloat(this.max)) {
        this.inputValue += parseFloat(this.step)
      }
    },
    decreaseValue () {
      if (this.inputValue - parseFloat(this.step) >= parseFloat(this.min)) {
        this.inputValue -= parseFloat(this.step)
      }
    }
  }
}
</script>

<style scoped lang="stylus">
.numberInput
  margin 0 auto
  width auto
  text-align left
  height 42px
  display inline-flex
  justify-content flex-start
  margin-bottom 12px
  align-items center
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button
    -webkit-appearance none
    margin 0
  input, &__plus, &__minus
    text-align center
    height 100%
    width 35px
    border 1px solid rgba(0,0,0,.2)
    padding 8px
  input
    font inherit
    -moz-appearance textfield
    width 55px
  &--large input
    width 70px
  &__minus
    border-bottom-left-radius 5px
    border-top-left-radius 5px
    border-right none
    cursor pointer
  &__plus
    border-bottom-right-radius 5px
    border-top-right-radius 5px
    border-left none
    cursor pointer
  label
    margin-left 10px
</style>
