<template>
  <div id="app">
    <side-menu v-show="userLoggedIn" />
    <div
      v-if="$store.state.showLoader"
      class="loadingScreen">
      <div class="loadingScreen__icon">
        <i class="fal fa-spinner-third fa-spin" />
      </div>
    </div>
    <div style="width: calc(100% - 190px); margin-left: 190px; padding: 20px">
      <router-view :user-logged-in="userLoggedIn" />
    </div>
    <button
      class="showMagicSideBar"
      @click.stop="$emit('openMagicSidebar')">
      <i class="fal fa-chevron-left" />
    </button>
  </div>
</template>

<script>
import SideMenu from '@/components/account/SideMenu.vue'
import httpClient from '@/services/httpClient'

export default {
  name: 'Account',
  components: {
    SideMenu
  },
  data () {
    return {
      userName: '',
      sideUserMenuHidden: true,
      sideUserMenuAction: 'signIn',
      apiUrl: httpClient.defaults.baseURL
    }
  },
  computed: {
    userLoggedIn () {
      return this.$store.state.userLoggedIn
    }
  }
}
</script>

<style lang="stylus">

.loadingScreen
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  background white
  display flex
  align-items center
  justify-content center
  z-index 999
  &__icon
    font-size 30px
    z-index 2

*:focus
  outline: none

.fal
  font-family "Font Awesome 5 Pro"
  font-weight 300
.fab
  font-family "Font Awesome 5 Brands"

.showMagicSideBar
  position fixed
  top 0
  right 0
  padding 10px 20px
  text-align center
  border 1px solid #eee
  font-size 16px
  background white
  cursor pointer
</style>
