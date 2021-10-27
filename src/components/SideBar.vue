<template>
  <div class="sideBar" :class="{ 'sideBar--hidden': hidden }">
    <button class="sideBar__closeButton" @click="$emit('close')">
      <i data-feather="chevron-right" />
    </button>
    <sign-in
      v-if="openPage === 'signIn'"
      @signedIn="handleSignedIn"
      @setUserData="setUserData"
      @openSnackbar="openSnackbar"
    />
    <user-page
      v-else
      ref="userPage"
      :cart="cart"
      :purchases="purchases"
      :user-data="userData"
      :cart-id="cartId"
      @logout="handleLogout"
      @openSignInPage="handleOpenSigninPage"
      @updateUserAvatar="updateUserAvatar"
      @openSnackbar="openSnackbar"
      @updateUserData="updateUserData"
      @makePurchase="handleMakePurchase"
      @removeOrder="removeOrder"
      @addProductToCart="addOrder"
      :cart-page-on-login="shouldRedirectAfterLogin"
    />
    <snackbar
      ref="snackbar"
      base-size="100px"
      :hold-time="5000"
      position="bottom-center"
    />
  </div>
</template>

<script>
import SignIn from '@/components/SideBar/SignIn.vue'
import UserPage from '@/components/SideBar/UserPage.vue'
import httpClient from '@/services/httpClient'
import Snackbar from 'vuejs-snackbar'
import currencyList from '@/assets/currencyList.json'
import * as Sentry from '@sentry/vue'
import parseSegmentProduct from '@/segmentProduct'

export default {
  name: 'SideBar',
  components: {
    SignIn,
    UserPage,
    Snackbar
  },
  props: {
    hidden: {
      type: Boolean,
      default: true
    },
    staging: {
      required: false,
      type: Boolean,
      default: false
    },
    apiUrl: {
      required: false,
      type: String
    }
  },
  data () {
    return {
      cartId: null,
      openPage: 'userPage',
      userData: {},
      cart: [],
      purchases: [],
      uniqueItemTypes: ['offer', 'room'], // Items that can't have quantity counter,
      shouldRedirectAfterLogin: false,
      addingToCart: []
    }
  },
  computed: {
    userIsLogged () {
      return this.userData.id
    },

    userLogginAction () {
      return this.$store.state.userLoginAction
    },

    isUserLoggedIn () {
      return this.$store.state.userLoggedIn
    }
  },
  watch: {
    cart: {
      handler () {
        this.$store.commit('updateCart', this.cart)
      },
      deep: true
    },
    cartId (val) {
      this.$store.commit('updateCartId', val)
    },
    userLogginAction (val) {
      if (val === 'loggedIn') {
        this.cartId = null
        this.cart = []
        this.loadCart()
      }
    },
    isUserLoggedIn (isLoggedIn) {
      if (!isLoggedIn) {
        // clean up
        this.userData = {}
        this.cart = []
        this.cartId = null
      }
    },
    hidden (isHidden) {
      if (isHidden) {
        setTimeout(() => {
          this.$refs.userPage.handleCloseAddressOutOfWizard()
        }, 500)
      }
    }
  },
  mounted () {
    if (this.staging) {
      httpClient.defaults.baseURL = 'https://api-staging.veganlogin.com'
    }
    if (this.apiUrl) {
      httpClient.defaults.baseURL = this.apiUrl
    }

    this.init()
  },
  methods: {
    handleOpenSigninPage (showMessage) {
      this.openPage = 'signIn'
      if (showMessage) {
        this.$refs.snackbar.info('Please login to continue Checkout')
        this.shouldRedirectAfterLogin = true
      }
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return price / Math.pow(10, currencyList[currency].fractionSize)
    },
    setCSRFheader (data) {
      httpClient.defaults.headers.common['x-csrf-token'] = data
      this.$emit('tokenChanged', data)
    },
    async init () {
      try {
        const response = await httpClient.get('/')
        httpClient.defaults.headers.common['x-csrf-token'] =
          response.headers['x-csrf-token']
        this.$emit('tokenChanged', response.headers['x-csrf-token'])
      } catch (error) {
        console.log(error)
      } finally {
        this.getUserInfo()
      }
    },
    async getUserInfo () {
      try {
        const response = await httpClient.get('/me')
        this.setCSRFheader(response.headers['x-csrf-token'])
        // User logged in
        this.setUserData(response.data)
        this.handleSignedIn()
        this.getUserAddressId()
        this.loadPurchases()
      } catch (error) {
        // User not logged in
        // this.setCSRFheader(error.response.headers['x-csrf-token'])
        this.openPage = 'signIn'
        this.$emit('signedOut')
      } finally {
        this.loadCart()
      }
    },
    openSnackbar ({ message, type }) {
      if (type === 'info') this.$refs.snackbar.info(message)
      else if (type === 'error') this.$refs.snackbar.error(message)
      else this.$refs.snackbar.open(message)
    },
    async getUserAddressId () {
      const response = await httpClient.get('/me/address/default')
      if (response.data.id) this.$store.commit('setUserAddressId', response.data.id)
    },
    // Cart related methods
    loadCart () {
      // Look for a cookie cart
      if (this.$cookies.get('cartId')) {
        this.cartId = this.$cookies.get('cartId')
        if (this.userIsLogged) {
          httpClient.patch(`/cart/${this.cartId}/merge`).then((response) => {
            this.$cookies.remove('cartId')
            this.loadItems(response.data.items)
            this.cartId = response.data.id
          })
        } else {
          httpClient.get(`/cart/${this.cartId}`).then((response) => {
            this.loadItems(response.data.items)
          })
        }
      } else {
        // No cookie cart found
        if (this.userIsLogged) {
          httpClient
            .get('/cart/active')
            .then((response) => {
              this.cartId = response.data.id
              this.loadItems(response.data.items)
            })
            .catch((error) => {
              this.createNewCart()
              console.log(error)
            })
        } else {
          this.createNewCart()
        }
      }
    },
    createNewCart () {
      httpClient.post('/cart').then((response) => {
        this.cartId = response.data.id
        if (!this.userIsLogged) {
          // If user is not logged in - create a cookie cart! 🍪
          this.$cookies.set('cartId', this.cartId)
          this.userData = {}
          this.cart = []
        }
      })
    },
    loadOfferings (items) {
      // Convert productofferings from carts to items with offerings
      for (const item of items) {
        httpClient
          .get(`/item/${item.item_id}?links=is-offering-for`)
          .then((response) => {
            // Get linked product!
            const linkedProductId = response.data.links[0].target
            httpClient.get(`/item/${linkedProductId}`).then((response2) => {
              const linkedProduct = response2.data
              linkedProduct.cart_item_id = item.id
              linkedProduct.offering = response.data
              linkedProduct.offering.quantity = item.quantity
              this.cart.push(linkedProduct)
            })
          })
      }
    },
    loadItems (items) {
      // Load all items and put them into the cart
      const offerings = []
      const otherItems = []
      for (const item of items) {
        if (item.item_id.includes('pof')) {
          offerings.push(item)
        } else {
          otherItems.push(item)
        }
      }

      this.loadOfferings(offerings)
      for (const item of otherItems) {
        httpClient.get(`/item/${item.item_id}`).then((response) => {
          let itemData = response.data
          itemData.cart_item_id = item.id
          itemData.offering = {
            id: itemData.id,
            price: itemData.price,
            currency: itemData.currency,
            quantity: 1, // We are then assuming that the desired quantity is 1 (offers, bookings)
            available_quantity: itemData.available_quantity
          }
          if (itemData.item_type === 'offer') {
            itemData = {
              ...itemData,
              guests: item.guests,
              'time-start': item['time-start']
            }
          } else if (itemData.item_type === 'room') {
            itemData = {
              ...itemData,
              guests: item.guests,
              period: item.period
            }
          }
          this.cart.push(itemData)
        })
      }
    },
    loadPurchases () {
      httpClient.get('/purchases').then((response) => {
        response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
        this.purchases = response.data
      })
    },
    handleMakePurchase (newPurchase) {
      newPurchase.isNew = true
      this.cart = []
      this.purchases = [newPurchase, ...this.purchases]
      this.$refs.userPage.openedPage = 'purchase-successfull'
      httpClient.post('/cart').then((response) => {
        this.cartId = response.data.id
      })
    },
    handleLogout () {
      this.openPage = 'signIn'
      httpClient.post('/auth/logout')
      this.$emit('signedOut')
      this.loadCart()
    },
    handleSignedIn () {
      this.openPage = 'userPage'
      this.$emit('signedIn', this.userData)

      if (this.shouldRedirectAfterLogin) {
        setTimeout(() => {
          this.shouldRedirectAfterLogin = false
        }, 3000)
      }
    },
    updateUserData (newUserData) {
      Object.assign(this.userData, newUserData)
      this.openSnackbar({ message: 'User successfully updated', type: 'info' })
    },
    updateUserAvatar (newAvatarURL) {
      this.userData.avatar = newAvatarURL
      this.openSnackbar({
        message: 'Successfully changed your photo',
        type: 'info'
      })
    },
    setUserData (userData) {
      this.userData = userData
      Sentry.setUser({
        email: userData.email.toLowerCase(),
        id: userData.id
      })
      this.$store.commit('setUserData', userData)
      this.$cookies.set('user_id', userData.id)
    },
    async addOrder (itemData) {
      if (this.addingToCart.includes(itemData.id)) return
      this.addingToCart.push(itemData.id)
      if (!itemData.offering) {
        // If product doesn't have an offsering - check if it has the price in itself
        if (itemData.price) {
          itemData.offering = {
            id: itemData.id,
            price: itemData.price,
            currency: itemData.currency,
            quantity: itemData.quantity, // We are then assuming that the desired quantity is 1 (offers, bookings)
            available_quantity: itemData.available_quantity
          }
        } else {
          console.error("Product doesn't have an offering nor a price!")
          return // Bye bye
        }
      }
      const existingOrderIndex = this.cart.findIndex(
        (order) => order.offering.id === itemData.offering.id
      )
      // if (!this.uniqueItemTypes.includes(itemData.item_type) || existingOrderIndex < 0) {
      if (!itemData.offering.quantity) itemData.offering.quantity = 1
      if (existingOrderIndex < 0) {
        let requestData = {
          item_id: itemData.offering.id,
          quantity: itemData.offering.quantity
        }
        if (itemData.item_type === 'offer') {
          requestData = {
            ...requestData,
            guests: itemData.guests,
            'time-start': itemData['time-start']
          }
        } else if (itemData.item_type === 'room') {
          requestData = {
            ...requestData,
            guests: itemData.guests,
            period: itemData.period
          }
        }
        try {
          await httpClient.post(`/cart/${this.cartId}/item`, requestData)
          // get item id
          const res = await httpClient.get(`/cart/${this.cartId}`)
          const targetItem = res.data.items.find(
            (item) => item.item_id === itemData.offering.id
          )
          if (targetItem) {
            itemData.cart_item_id = targetItem.id
          }

          this.openSnackbar({
            message: `${itemData.name} added to cart`,
            type: 'info'
          })
          this.cart.push(itemData)
        } catch (e) {
          console.log(e.response)
          this.openSnackbar({
            message: 'There was an error adding item to cart',
            type: 'error'
          })
          Sentry.captureMessage('Adding to cart catched error #1')
          Sentry.captureException(e)
        }
        // ! temp
        // this.cart.push(itemData)
        // httpClient.post(`/cart/${this.cartId}/item`, requestData)
      } else {
        try {
          this.cart[existingOrderIndex].offering.quantity += itemData.offering.quantity
          await httpClient.patch(
            `/cart/${this.cartId}/item/${this.cart[existingOrderIndex].cart_item_id}`,
            {
              quantity: this.cart[existingOrderIndex].offering.quantity
            }
          )
          this.openSnackbar({
            message: `${itemData.name} added to cart`,
            type: 'info'
          })
        } catch (e) {
          console.log(e.response)
          this.cart[existingOrderIndex].offering.quantity -= itemData.offering.quantity
          this.openSnackbar({
            message: 'There was an error adding item to cart',
            type: 'error'
          })
          Sentry.captureMessage('Adding to cart catched error #2')
          Sentry.captureException(e)
        }
        // ! temp
        // this.cart[existingOrderIndex].offering.quantity += 1
        // httpClient.patch(
        //   `/cart/${this.cartId}/item/${this.cart[existingOrderIndex].cart_item_id}`,
        //   {
        //     quantity: this.cart[existingOrderIndex].offering.quantity,
        //   }
        // )
      }
      if (this.$refs.userPage) {
        this.$refs.userPage.$forceUpdate()
      }

      this.addingToCart = this.addingToCart.filter(id => id !== itemData.id)
      this.$store.commit('cartUpdated')
      this.$forceUpdate()
      window.analytics.track('Product Added', {
        ...parseSegmentProduct(itemData),
        cart_id: this.$store.cartId,
        position: this.cart.length
      })
    },
    async removeOrder (index, showMessage = true) {
      try {
        const item = this.cart[index]
        await httpClient.delete(
          `/cart/${this.cartId}/item/${this.cart[index].cart_item_id}`
        )
        if (showMessage) {
          this.openSnackbar({
            message: `${this.cart[index].name} removed from cart`,
            type: 'info'
          })
        }
        this.cart.splice(index, 1)
        this.$forceUpdate()
        window.analytics.track('Product Removed', {
          ...parseSegmentProduct(item),
          cart_id: this.$store.cartId,
          position: index + 1
        }, {
          integrations: {
            'All': true,
            'Algolia': false
          }
        })
      } catch (e) {
        console.log(e)
      }
    },
    openCart () {
      this.openPage = 'userPage'
      this.$nextTick(() => {
        this.$refs.userPage.openedPage = 'cart'
      })
    }
  }
}
</script>

<style lang="stylus">
.spin {
  animation-name: spin;
  animation-duration: 2s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

.feather {
  stroke-width: 1.3px;
}

.sideBar {
  display: flex;
  position: fixed;
  right: 0;
  top: 0;
  width: 470px;
  height: 100%;
  box-sizing: border-box;
  text-align: left;
  padding: 23px;
  // overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: white;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 500ms cubic-bezier(0.785, 0.135, 0.15, 0.86);
  z-index: 3;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.01);
  border-left: 1px solid #e4e4e4;
  font-family: 'Helvetica Neue', 'Helvetice', 'Arial', sans-serif;
  font-size: 14px;
  transform: translateX(0);

  &--hidden {
    transform: translateX(100%);
    box-shadow: 0 0 24px rgba(0, 0, 0, 0);
  }

  &__closeButton {
    position: absolute;
    top: 5px;
    left: 12px;
    font-size: 18px;
    border: none;
    background: transparent;
    color: black;
    cursor: pointer;
    transition-duration: 0.2s;
    z-index: 2;

    &:hover {
      opacity: 0.8;
    }
  }
}

@media screen and (max-width: 520px) {
  .sideBar {
    width: 100%;
    padding: 20px 10px;

    &__closeButton {
      left: 0;
    }
  }
}
</style>
