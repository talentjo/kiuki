<template>
  <div class="codeInput">
    <input
      v-for="index in 6"
      :ref="`numberInput_${index}`"
      :key="`numberInput_${index}`"
      type="number"
      max="9"
      @keydown.backspace="handleClear(index)"
      @focus="handleFocus(index)"
      @input="handleInput(index)">
    <!--
    <button @click="handleSubmit()">
      <LoaderIcon v-if="loading" class="icon"></LoaderIcon>
      <ChevronIcon v-else class="icon"></ChevronIcon>
    </button>
    -->
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import { Loader, ChevronRight } from 'vue-feather-icon'

/* eslint-disable */
export default {
  name: 'CodeInput',
  components: {
    LoaderIcon: Loader.default,
    ChevronIcon: ChevronRight.default,
  },
  data: function() {
    return {
      loading: false,
    }
  },
  methods: {
    getCode() {
      let code = ''
      for (let i = 1; i <= 6; i++) {
        let input = this.$refs[`numberInput_${i}`][0]
        code += input.value
      }
      return code
    },
    handleClear(index) {
      for (let i = 1; i <= 6; i++) {
        let input = this.$refs[`numberInput_${i}`][0]
        input.value = ''
      }
      this.$refs[`numberInput_1`][0].focus()
      this.$emit('error', '')
    },
    handleFocus(index) {
      if (index > 1 && this.$refs[`numberInput_${index - 1}`][0].value === '') {
        this.$refs[`numberInput_${index - 1}`][0].focus()
      }
      if (index < 6 && this.$refs[`numberInput_${index}`][0].value !== '') {
        this.$refs[`numberInput_${index + 1}`][0].focus()
      }
      if (index === 6 && this.$refs[`numberInput_${index}`][0].value !== '') {
        this.handleSubmit()
      }
    },
    handleInput(index) {
      let input = this.$refs[`numberInput_${index}`][0]
      if (input.value.length > 1) {
        let value = input.value.split``
        for (let i = index; i <= 6; i++) {
          this.$refs[`numberInput_${i}`][0].value = value[i - 1]
        }
      }
      if (index < 6) {
        if (input.value.length === 1) {
          let nextInput = this.$refs[`numberInput_${index + 1}`][0]
          nextInput.focus()
        }
      } else {
        input.blur()
        this.handleSubmit()
      }
    },
    handleSubmit() {
      this.loading = true
      httpClient
        .post('auth/login', {
          login_token: this.getCode(),
        })
        .then(response => {
          this.loading = false
          this.$emit('success', response.data)
          this.$store.commit('updateUserLoginAction', 'loggedIn')
        })
        .catch(error => {
          this.loading = false
          this.$emit('error', error.response.data.message)
          this.$refs[`numberInput_6`][0].focus()
        })
    },
  },
}
</script>

<style scoped lang="stylus">
.feather, svg
  stroke-width 1.3px
  stroke white

input[type=number]::-webkit-inner-spin-button
  -webkit-appearance none

input[type=number]
  -moz-appearance textfield

.codeInput
  margin 10px 0
  display flex
  align-items center
  width 100%
  input
    display inline-block
    border-radius 5px
    border 1px solid #e4e4e4
    margin-right 12px
    font-size 18px
    width 40px
    height 44px
    text-align center
    box-sizing border-box
    padding 10px
  button
    display inline-flex
    align-items center
    justify-content center
    width 40px
    height 40px
    border-radius 40px
    color white
    padding-top 1px
    background-color #008fe4
    font-size 17px
    font-weight 800
    cursor pointer
    border none
    transition-duration .2s
    &:hover
      opacity .9
</style>
