<template>
  <div class="topNavbar" style="background: #fafafa">
    <!-- Primary nav -->
    <nav class="primary-nav">
      <ul class="primary-nav__list">
        <li class="primary-nav__item" v-for="item in primaryNavItems" :key="item.to">
          <router-link :to="item.to">
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="top">
      <button class="side-menu-button"
        v-if="$route.matched[0].path !== '/account'"
       :class="{'side-menu-button--active': showDesktopMagicMenu}"
       @click.stop="$emit('openDesktopMagicMenu')">
        <i class="fal fa-bars" />
      </button>
      <div class="left">
        <button
          class="topNavbar__mobileMenuOpener"
          @click.stop="$emit('openMobileMenu')">
          <i class="fal fa-bars" />
        </button>
        <div class="topNavbar__search-container">
          <i
            class="fas fa-search topNavbar__search"
            @click="openSearch" />
          <transition name="search">
            <ais-search-box v-if="searchOpen">
              <template slot-scope="{ refine }">
                <input
                  type="search"
                  ref="search"
                  @input="search($event.currentTarget.value, refine)"
                  class="topNavbar__searchbox desktop"
                  placeholder="Search here"
                  :class="{ 'topNavbar__searchbox--open': searchOpen }"
                  :autofocus="true"
                  @blur="!$event.currentTarget.value ? closeSearch() : null"
                  @keyup.enter="search($event.currentTarget.value); closeSearch()">
              </template>
            </ais-search-box>
          </transition>
        </div>
        <router-link
          class="topNavbar__logo"
          to="/">
          <img
            v-if="$route.matched[0].path === '/magazine'"
            src="@/assets/magazine_top.png"/>
          <img
            v-else
            src="@/assets/mightyplants_top.png">
        </router-link>
      </div>
      <div class="right">
        <button
          class="topNavbar__cart"
          @click.stop="$emit('openCart')">
          <i class="fal fa-shopping-bag" />
          <div class="counter">
            <p>{{ ordersQuantity }}</p>
          </div>
        </button>
        <template v-if="$store.state.userLoggedIn">
          <button
            class="topNavbar__user"
            :style="{ backgroundImage: `url(${avatar})` }"
            @click.stop="$emit('openMagicSidebarUser')" />
        </template>
        <template v-else>
          <button @click.stop="$emit('openMagicSidebar')">
            <i class="fal fa-user" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import algolia from '@/services/algolia'
import imgix from '@/services/imgix'

export default {
  name: 'TopNavbar',
  props: {
    userData: Object,
    ordersQuantity: Number,
    showDesktopMagicMenu: Boolean
  },
  data () {
    return {
      searchOpen: false,
      primaryNavItems: [
        {
          label: 'restaurants',
          to: '/restaurants'
        },
        {
          label: 'magazine',
          to: '/magazine'
        },
        {
          label: 'recipes',
          to: '/recipes'
        },
        {
          label: 'about us',
          to: '/mag/about-us'
        }
      ],
      algolia,
      imgix,
      searchDebounceTimer: null,
      searchEventDebounceTimer: null
    }
  },
  computed: {
    avatar () {
      if (typeof this.userData.avatar !== 'undefined') {
        return this.userData.avatar
      }
      return ''
    }
  },
  methods: {
    search (query, refine = null) {
      clearTimeout(this.searchDebounceTimer)

      if (query.length === 0) {
        window.history.back()
        return
      }

      this.searchDebounceTimer = setTimeout(() => {
        if (refine) refine(query)
        if (this.$route.name !== 'searchPage') {
          this.$router.push(`/search/${query}`)
        }
        window.history.replaceState(null, null, `/search/${query}`)

        clearTimeout(this.searchEventDebounceTimer)
        this.searchEventDebounceTimer = setTimeout(() => {
          window.analytics.track('Products Searched', {
            query
          }, {
            integrations: {
              'All': true,
              'Algolia': false
            }
          })
        }, 3000)
      }, 200)
    },
    openSearch () {
      this.searchOpen = true
      setTimeout(() => { this.$refs.search.focus() }, 300) // workaround for refs in transition/templates
    },
    closeSearch () {
      this.searchOpen = false
    }
  }
}
</script>

<style scoped lang="stylus">
.primary-nav {
  max-width 1140px
  margin 0 auto

  &__list {
    margin: 0;
    padding: 0;
    list-style none
    display flex
    justify-content flex-end
    margin-bottom: 10px

    @media only screen and (max-width: 400px) {
      margin-bottom: 15px
    }

    & > * + * {
      margin-left: 25px

      @media only screen and (max-width: 400px) {
        margin-left: 10px
      }
    }
  }

  &__item {
    padding: 5px 0
    text-transform uppercase
    font-size 14px

    @media only screen and (max-width: 400px) {
      font-size 12px
    }
  }
}

.side-menu-button {
  position absolute
  left 0
  background-color yellow
  text-align left
  display block
  background none
  color: #333 !important
  fonr-family inherit
  font-size: 17px
  padding: 13px;
  border-radius 7px
  line-height 1
  cursor pointer
  display flex
  align-items center
  transition all .2s ease-in-out

  @media screen and (max-width: 991.98px) {
    display none
  }
}
.topNavbar
  position relative
  width 100%
  padding 1rem 0.625rem
  top 0
  z-index 3
  background #fff
  > .top
    display flex
    align-items center
    justify-content center
    @media screen and (max-width: 530px)
      // justify-content space-between
  i
    font-size 23px
  .left, .right
    display flex
    align-items center
  .right
    position absolute
    right 0.225rem
    @media screen and (max-width: 530px)
      // position static
  &__mobileMenuOpener
    margin-right .5rem
    position absolute
    left 0.025rem
    @media screen and (max-width: 530px)
      // position static
  &__search-container
    height 100%
    display flex
    display -webkit-flex
    justify-content center
    -webkit-justify-content center
    align-items center
    -webkit-align-items center
    position absolute
    left 3.5rem
    z-index 1
    @media screen and (max-width: 500px)
      left 2.8rem
  &__search
    margin .1875rem .5rem .1875rem auto
    cursor pointer
    color var(--color-blue)
  .ais-SearchBox
    background #fafafa
    border-color #fafafa
    border-style solid
    border-width 1rem 0rem 1rem 0
    @media screen and (max-width: 399px)
      border-right-width 4rem
    @media screen and (min-width: 500px) and (max-width: 750px)
      border-right-width 6rem
  &__searchbox
    width 100%
    max-width 0
    padding 0
    border none
    font-size 13px
    background-color white
    color black
    z-index 100
    font-family inherit
    transition all .1s
    border-radius 1rem
    opacity 0
    &--open
      padding 3px 10px
      max-width 200px
      border 1px solid #ccc
      margin-right .5rem
      opacity 1
      &.mobile
        padding .5rem
    &__results
      position: absolute
      background: #fff
      border: 1px solid #e4e4e4;
      list-style: none;
      width: 30rem
      right: 0
      li
        display: flex
        margin: 17px 0
        align-items: center
        justify-content: flex-start
        text-align: left
        .photo
          width: 120px
          min-width: 120px
          height: 70px
          margin-right: 23px
          overflow: hidden
          img
            display: block;
            margin: 0 auto;
            height: 100%;
            object-fit: contain;
  &__user
    width 23px
    height 23px
    border-radius 50px
    background-size cover
    background-position center
  &__cart
    position relative
    display flex
    align-items center
    padding .25rem .75rem
    margin-right .2rem
    .counter
      position absolute
      width 17px
      height 17px
      bottom -4px
      right 0
      font-size 12px
      background-color black
      color white
      border-radius 50px
      font-weight 600
      display flex
      align-items center
      justify-content center
      padding 0
      text-align center
      p
        margin 0
        color white
        font-size 13px
        margin-left 1px
  &__logo img
    margin 15px
    height: 3rem
    display block
    @media screen and (max-width: 500px)
      height: 2.5rem
  button
    background-color transparent
    border none
    cursor pointer
    font-size 13px
    font-family inherit
@media screen and (min-width: 992px)
  .topNavbar__mobileMenuOpener
    display none
@media screen and (min-width: 530px)
  .topNavbar
    .mobileSearch
      display none
@media screen and (max-width: 349.98px)
  .topNavbar
    padding 1rem 0
    &__search
      margin: 0.1875rem 0.35rem 0.1875rem auto;
    &__cart
      margin-right .2rem

.search-enter-active,
.search-leave-active
  transition opacity .2s

.search-enter,
.search-leave-to
  opacity 0

</style>
