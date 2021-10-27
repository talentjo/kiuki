<template>
  <div id="app">
    <CornerAlert ref="cornerAlert" />
    <MobileMenu
      :is-open="mobileMenuOpen"
      :categories="menuCategories"
      @closeMobileMenu="() => (mobileMenuOpen = false)" />
    <div :class="$route.matched[0].path !== '/account' ? 'container' : ''">
      <ais-instant-search
        :search-client="algolia"
        :index-name="ALGOLIA_INDEX"
        >
        <TopNavbar
          v-if="$route.matched[0].path !== '/account'"
          class="top-navbar"
          :user-data="userData"
          :showDesktopMagicMenu="showDesktopMagicMenu"
          :orders-quantity="$refs.magicSidebar ? getCartLength() : 0"
          @openMobileMenu="() => (mobileMenuOpen = !mobileMenuOpen)"
          @openDesktopMagicMenu="() => (showDesktopMagicMenu = !showDesktopMagicMenu)"
          @openMagicSidebar="openSignInPage"
          @openMagicSidebarUser="
            () => {
              magicSideBarOpen = true
            }
          "
          @openCart="openCart" />
        <div
          v-if="$route.matched[0].path !== '/account'"
          class="left">
          <MagicMenu
            :show="showDesktopMagicMenu"
            @closeDesktopMagicMenu="() => showDesktopMagicMenu = false"
            :categories="menuCategories"
            :has-top-margin="true" />
        </div>
        <div
          class="right"
          :style="$route.matched[0].path === '/account' ? 'width: 100%' : ''">
          <router-view
            :key="$route.path"
            @addProductToCart="addProductToCart"
            @openMagicSidebar="openSignInPage" />
          <MagicSidebar
            ref="magicSidebar"
            :api-url="apiUrl"
            :staging="isDev"
            :hidden="!magicSideBarOpen"
            @click.stop=""
            @signedIn="handleSignedIn"
            @signedOut="handleSignedOut"
            @tokenChanged="handleCSRFtokenChanged"
            @close="
              () => {
                magicSideBarOpen = false
              }
            " />
          <footer v-if="$route.matched[0].path !== '/account'">
            <img
              src="@/assets/mightyplants_bottom.png"
              style="margin-right: 10px; height: 6rem">
            <p>
              <a
                href="https://help.mightyplants.com/en/collections/2947533-delivery-information"
                alt="Delivery"
                target="_blank">Delivery</a>
              <a
                href="https://help.mightyplants.com/en/collections/2947599-faq-s"
                alt="FAQ"
                target="_blank">FAQ</a>
              <a
                href="https://help.mightyplants.com/en/collections/2947774-about-us"
                alt="AboutUs"
                target="_blank">About Us</a>
              <a
                href="https://help.mightyplants.com/en/collections/2947591-legals"
                alt="Legals"
                target="_blank">Legals</a>
              <a
                href="https://help.mightyplants.com/en/articles/5232528-refund-policy"
                alt="Refund Policy"
                target="_blank"
              >Refund Policy</a>
            </p>
            <p>
              <a
                href="https://www.facebook.com/mightyplantsuk"
                target="_blank"><i class="fab fa-facebook-f" /></a>
              <a
                href="https://www.instagram.com/mighty_plants/"
                target="_blank"><i class="fab fa-instagram" /></a>
            </p>
            <p>hello@mightyplants.com</p>
            <p class="bottomLine">
              Mighty Plants©
            </p>
            <img
              src="@/assets/payment_methods.svg"
              style="margin-right: 10px; height: auto; width: 500px; max-width: 100%">
            <p>Unit 2B Rapier Court, Sabre Close, Heathfield, Newton abbot, TQ12 6TW. Tel: 01626437747.</p>
            <p>Registered Business Number: 10509608</p>
            <p>VAT Number: 305845406</p>
          </footer>
        </div>
      </ais-instant-search>
    </div>
  </div>
</template>

<script>
import TopNavbar from '@/components/TopNavbar.vue'
import MagicMenu from '@/components/MagicMenu.vue'
import MobileMenu from '@/components/MobileMenu.vue'
import MagicSidebar from '@/components/SideBar.vue'
import ClickOutside from 'vue-click-outside'
import CornerAlert from '@/components/CornerAlert.vue'
import '@/assets/sidebar.css'
import menuCategories from '@/menuCategories.js'
import { API_URL, ALGOLIA_INDEX } from '@/config.js'
import httpClient from '@/services/httpClient.js'
import algolia from '@/services/algolia'

export default {
  components: {
    TopNavbar,
    MagicMenu,
    MagicSidebar,
    CornerAlert,
    MobileMenu
  },
  refs: ['magicSidebar'],
  directives: {
    ClickOutside
  },
  mounted () {
    // check for sidebar purchases query
    if (this.$route.query && this.$route.query.sidebar) {
      if (!Array.isArray(this.$route.query.sidebar) && this.$route.query.sidebar === 'purchases') {
        this.magicSideBarOpen = true
      }
    }

    window.analytics.identify(this.$store.state.userData.id, {
      name: this.$store.state.userData.name,
      email: this.$store.state.userData.email
    }, {
      integrations: {
        'All': true,
        'Algolia': false
      }
    })
  },
  data () {
    return {
      magicSideBarOpen: false,
      magicSideBarUpdatesCounter: 0,
      mobileMenuOpen: false,
      userData: {},
      API_URL,
      menuCategories,
      showDesktopMagicMenu: false,
      algolia,
      ALGOLIA_INDEX
    }
  },
  computed: {
    isDev () {
      return process.env.NODE_ENV === 'development'
    },
    apiUrl () {
      return API_URL
    }
  },
  methods: {
    closeSidebar (e) {
      if (
        !e.target.classList.contains('fa-plus-circle') &&
        !e.target.closest('.addToCartButton') &&
        !e.target.closest('.pac-container')
      ) {
        this.magicSideBarOpen = false
      }
    },
    getCartLength () {
      if (this.$refs.magicSidebar.cart.length === 0) {
        return 0
      }
      let isFeeIncluded = false
      this.$refs.magicSidebar.cart.forEach((item) => {
        if (
          item.slug.includes('shipping-fee') ||
          item.name.toLowerCase() === 'shipping fee'
        ) {
          isFeeIncluded = true
        }
      })
      let quantity = this.$refs.magicSidebar.cart.map(item => item.offering && item.offering.quantity).reduce((acc, cur) => acc + cur)
      if (isFeeIncluded && this.$refs.magicSidebar.cart.length > 1) {
        return quantity - 1
      }
      return quantity
    },
    handleCSRFtokenChanged (newToken) {
      httpClient.defaults.headers.common['X-CSRF-TOKEN'] = newToken
    },
    handleSignedIn (userData) {
      this.$store.commit('login')
      this.userData = userData
    },
    handleSignedOut (userData) {
      this.$store.commit('logout')
    },
    addProductToCart (itemData) {
      if (
        !itemData.offering &&
        Array.isArray(itemData.offerings) &&
        itemData.offerings.length > 0
      ) {
        itemData.offering = itemData.offerings[0]
      }

      this.$refs.magicSidebar.addOrder(itemData)
      this.$refs.cornerAlert.openItem(itemData)
    },
    openSignInPage () {
      this.magicSideBarOpen = true
      this.$refs.magicSidebar.openPage = 'signIn'
    },
    openCart () {
      this.magicSideBarOpen = true
      this.$refs.magicSidebar.openCart()
    }
  }
}
</script>

<style lang="stylus">
@font-face
  font-family "Font Awesome 5 Brands"
  font-style normal
  font-weight normal
  src url(assets/webfonts/fa-brands-400.eot)
  src: url(assets/webfonts/fa-brands-400.eot?#iefix) format("embedded-opentype"),
    url(assets/webfonts/fa-brands-400.woff2) format("woff2"),
    url(assets/webfonts/fa-brands-400.woff) format("woff"),
    url(assets/webfonts/fa-brands-400.ttf) format("truetype"),
    url(assets/webfonts/fa-brands-400.svg#fontawesome) format("svg")
@font-face
  font-family "Font Awesome 5 Pro"
  font-style normal
  font-weight 300
  src url(assets/webfonts/fa-light-300.eot)
  src url(assets/webfonts/fa-light-300.eot?#iefix) format("embedded-opentype"), url(assets/webfonts/fa-light-300.woff2) format("woff2"), url(assets/webfonts/fa-light-300.woff) format("woff"), url(assets/webfonts/fa-light-300.ttf) format("truetype"), url(assets/webfonts/fa-light-300.svg#fontawesome) format("svg")
@font-face
  font-family "Font Awesome 5 Pro Solid"
  font-style normal
  font-weight 800
  src url(assets/webfonts/fa-solid.otf)
.fal
  font-family "Font Awesome 5 Pro"
  font-weight 300
.fab
  font-family "Font Awesome 5 Brands"
.fas
  font-family "Font Awesome 5 Pro Solid"
  font-weight 800
*
  box-sizing border-box
html, body
  margin 0
a
  color inherit
  text-decoration none
*:focus
  outline none

#app
  font-family 'Open Sans', Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #000
  background #fafafa

.container
  max-width 1140px
  min-height 100vh
  margin 0 auto
  text-align center

footer
  display inline-block
  margin 40px auto 20px auto
  left 0
  right 0
  height auto
  font-size 12px
  i, span
    margin-right 6px
  a:not(.bottomLine)
    margin 0 5px
    font-size 14px
  p.bottomLine
    color #ccc

@media screen and (max-width: 1199.98px)
  .container
    padding 0 10px

@media screen and (max-width: 991.98px)
  .container > div > .left
    display none
  .container > div > .right
    grid-column: 1 / -1
</style>
