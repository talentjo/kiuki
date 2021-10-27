<template>
  <div class="userSettings">
    <label for="Full name">Full name</label>
    <input
      v-model="name"
      name="Full name"
      type="text">
    <label for="Display name">Display name</label>
    <input
      v-model="displayName"
      name="Display name"
      type="text">
    <div class="userSettings__buttons">
      <BlackButton
        :loading="loading"
        @click.native.stop="updateUserData()">
        Save
      </BlackButton>
      <button
        class="goBack"
        aria-label="Go back"
        @click.stop="$emit('goBack')">
        <span>Back</span>
      </button>
    </div>
  </div>
</template>

<script>
import BlackButton from '@/components/BlackButton.vue'
import httpClient from '@/services/httpClient'
import Feather from 'feather-icons'

export default {
  name: 'UserSettings',
  components: {
    BlackButton
  },
  props: {
    userData: Object
  },
  data () {
    return {
      loading: false,
      name: '',
      displayName: ''
    }
  },
  mounted () {
    Feather.replace()
  },
  updated () {
    Feather.replace()
  },
  created () {
    this.name = this.userData.name
    this.displayName = this.userData.display_name
  },
  methods: {
    updateUserData () {
      this.loading = true
      httpClient
        .patch('/me', {
          name: this.name,
          display_name: this.displayName
        })
        .then((response) => {
          this.loading = false
          this.$emit('updateUserData', {
            name: this.name,
            display_name: this.displayName
          })
        })
        .catch((error) => {
          this.loading = false
          console.log(error)
        })
    }
  }
}
</script>

<style scoped lang="stylus">
.userSettings
  display block
  font-size 14px
  &__buttons
    margin-top 20px
    display flex
    align-items center
    justify-content flex-start
  label
    display block
    margin-top 20px
    margin-bottom 2px
  input
    width 80%
    border 1px solid #f2f2f2
    background white
    padding 9px
    font inherit
  button.goBack
    display inline-block
    position relative
    margin-left 16px
    height 32px
    padding 0
    cursor pointer
    background white
    font inherit
    border none
  button[type='submit']
    display inline-flex
    align-items center
    justify-content center
    color white
    height 32px
    width 90px
    background-color #008fe4
    border-radius 5px
    font inherit
    cursor pointer
    border none
    transition-duration .2s
    &:hover
      opacity .9
    p
      margin 0
      color white
    .icon
      margin 0
      height 13px
</style>
