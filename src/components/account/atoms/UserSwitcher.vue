<template>
  <div
    v-click-outside="
      () => {
        dropdownOpen = false
      }
    "
    class="userSwitcher"
    @click="dropdownOpen = !dropdownOpen">
    <template v-if="!selectedOrg">
      <div
        class="userSwitcher__photo"
        :style="{ backgroundImage: `url(${userData.avatar})` }" />
      <p>{{ username }}</p>
    </template>
    <template v-else-if="selectedOrg">
      <div
        class="userSwitcher__photo"
        :style="{ backgroundImage: `url(${selectedOrg.logo})` }" />
      <p>{{ username }}</p>
    </template>
    <template v-else>
      <LoadingBox
        width="32px"
        height="32px"
        :round="true"
        style="margin-right: 8px" />
      <LoadingBox
        width="112px"
        height="14px" />
    </template>
    <div
      class="userSwitcher__arrow"
      :class="{ 'userSwitcher__arrow--rotated': dropdownOpen }">
      <i class="fal fa-chevron-down" />
    </div>
    <div
      v-if="userData"
      class="userSwitcher__dropdown"
      :class="{ 'userSwitcher__dropdown--open': dropdownOpen }">
      <div class="userSwitcher__dropdownContainer">
        <button
          :selected="!selectedOrg"
          @click="unsetOrg">
          {{ userData.name }}
        </button>
        <button
          v-for="org in organisations"
          :key="`org_${org.name}`"
          :selected="selectedOrg === org"
          @click="setOrg(org)">
          {{ org.name }}
        </button>
        <router-link to="/account/new/organisation">
          <button>Add organisation...</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingBox from '@/components/account/atoms/LoadingBox.vue'
import httpClient from '@/services/httpClient'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'UserSwitcher',
  components: {
    LoadingBox
  },
  directives: {
    ClickOutside
  },
  data () {
    return {
      dropdownOpen: false,
      organisations: [],
      selectedOrg: null
    }
  },
  computed: {
    userData () {
      return this.$store.state.userData || null
    },
    username () {
      if (this.selectedOrg) {
        if (this.selectedOrg.name.length > 15) {
          return `${this.selectedOrg.name.substring(0, 13)}...`
        }
        return this.selectedOrg.name
      } if (this.userData.name) {
        if (this.userData.name.length > 15) {
          return `${this.userData.name.substring(0, 13)}...`
        }
        return this.userData.name
      }
      return ''
    },
    orgsAddedDuringSession () {
      return this.$store.state.orgsAddedDuringSession
    }
  },
  watch: {
    userData () {
      this.getOrganisations()
    },
    orgsAddedDuringSession () {
      this.getOrganisations()
    }
  },
  created () {
    if (this.$cookies.get('orgData')) {
      this.selectedOrg = this.$cookies.get('orgData')
      this.$store.commit('setOrgData', this.selectedOrg)
    }
  },
  mounted () {
    this.getOrganisations()
    this.$root.$on('changeOrg', (payload) => {
      this.unsetOrg()
      this.setOrg(payload)
    })
  },
  methods: {
    getOrganisations () {
      httpClient.get('/me/orgs').then((response) => {
        this.organisations = response.data
      })
    },
    unsetOrg () {
      this.selectedOrg = null
      this.$cookies.remove('orgData')
      this.$store.commit('setOrgData', null)
    },
    setOrg (orgData) {
      this.selectedOrg = orgData
      this.$cookies.set('orgData', orgData)
      this.$store.commit('setOrgData', orgData)
    }
  }
}
</script>

<style scoped lang="stylus">
.userSwitcher
  position relative
  width 200px
  padding 10px
  background-color white
  box-shadow 0 2px 8px rgba(0, 0, 0, .08)
  cursor pointer
  transition background-color .1s, transform .12s
  display flex
  align-items center
  justify-content flex-start
  z-index 3
  &:hover
    background-color #fcfcfc
    transform scale(1.03)
  &__arrow
    position absolute
    top calc(50% - 8px)
    right 10px
    color #666
    transition transform .13s
    transition-timing-function ease-in-out
    &--rotated
      transform rotate(180deg)
  &__photo
    width 32px
    height 32px
    margin-right 8px
    border-radius 50px
    background-color #f3f3f3
    background-size cover
    background-position center
    background-repeat no-repeat
  p
    margin 0
  &__dropdown
    width 100%
    position absolute
    top 100%
    max-height 0px
    left 0
    background #222
    overflow-y scroll
    transition max-height .12s
    transition-timing-function ease-in-out
    box-shadow 0 2px 8px rgba(0, 0, 0, .08)
    button
      width 100%
      padding 6px 10px
      font-weight 600
      color white
      border none
      cursor pointer
      background-color transparent
      text-align left
      font-size 12px
      transition background-color .08s
      &[selected]
        background-color dodgerblue
        &:hover
          background-color dodgerblue
      &:hover
        background-color rgba(255, 255, 255, .05)
    &--open
      max-height 500px
  &__dropdownContainer
    width 100%
    height auto
</style>
