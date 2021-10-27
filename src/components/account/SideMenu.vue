<template>
  <div class="sideMenu">
    <UserSwitcher />
    <template v-if="this.$store.state.userData.is_admin && !isOrgPage">
      <router-link to="/account/item-approval">
        <button special>
          <i class="fal fa-ballot-check" />
          Item approval
        </button>
      </router-link>
      <router-link to="/account/admin-item-claims">
        <button special>
          <i class="fal fa-gavel" />
          Ownership claims
        </button>
      </router-link>
      <div style="margin-bottom: 10px" />
    </template>
    <router-link to="/account">
      <button>
        <i class="fal fa-home" />
        Home
      </button>
    </router-link>
    <router-link to="/account/new">
      <button>
        <i class="fal fa-plus" />
        Add new
      </button>
    </router-link>
    <router-link
      v-if="isOrgPage"
      to="/account/items/all">
      <button>
        <i class="fal fa-box-full" />
        My items
      </button>
    </router-link>
    <router-link
      v-if="isOrgPage"
      to="/account/collections">
      <button>
        <i class="fal fa-boxes" />
        My collections
      </button>
    </router-link>
    <router-link
      v-if="isOrgPage"
      to="/account/my-addresses">
      <button>
        <i class="fal fa-map-marker-alt" />
        My Addresses
      </button>
    </router-link>
    <router-link to="/account/messages">
      <button>
        <i class="fal fa-comments" />
        Messages
      </button>
    </router-link>
    <router-link to="/account/orders">
      <button>
        <i class="fal fa-box" />
        Orders
      </button>
    </router-link>
    <router-link to="/account/bookings">
      <button>
        <i class="fal fa-calendar-check" />
        Bookings
      </button>
    </router-link>
    <!-- <router-link to="/account/organisations">
      <button>
        <i class="fal fa-building" />
        Organisations
      </button>
    </router-link> -->
    <router-link to="/account/item-claims">
      <button>
        <i class="fal fa-badge-check" />
        Ownership claims
      </button>
    </router-link>
    <router-link to="/account/settings">
      <button style="margin-top: 20px">
        <i class="fal fa-cog" />
        Settings
      </button>
    </router-link>
  </div>
</template>

<script>
import UserSwitcher from '@/components/account/atoms/UserSwitcher.vue'

export default {
  name: 'SideMenu',
  components: {
    UserSwitcher
  },
  computed: {
    isOrgPage () {
      const obj = this.$store.state.orgData
      if (typeof obj !== 'undefined' && obj !== null) {
        return !(Object.keys(obj).length === 0 && obj.constructor === Object)
      }
      return false
    }
  }
}
</script>

<style scoped lang="stylus">
.sideMenu
  display flex
  position fixed
  left 0
  top 0
  height 100%
  text-align left
  padding 15px 10px
  flex-direction column
  justify-content flex-start
  z-index 3
  button
    position relative
    width 200px
    padding 7px 10px
    background-color white
    box-shadow 0 2px 8px rgba(0, 0, 0, .08)
    cursor pointer
    border none
    font inherit
    transition background-color .1s, transform .12s
    display flex
    align-items center
    justify-content flex-start
    &:hover
      background-color #fcfcfc
      transform scale(1.03)
    &[special]
      height 30px
      padding 0 10px
      color red
      box-shadow 0 0 2px red
      font-size 13px
      i
        font-size 16px
        color red
  i
    font-size 17px
    color #ccc
    margin-right 12px
  a
    margin-top 12px
.router-link-exact-active
  button
    box-shadow 0 0 4px 1px dodgerblue
    color dodgerblue
    i
      color dodgerblue

@media screen and (max-width: 520px) // Relative to TopMenu!
  .sideMenu
    padding-top 50px
</style>
