<template>
  <div class="userPage">
    <nav class="userpage__nav">
      <ul>
        <li>
          <button disabled>
            <i data-feather="bell" />
            <p>Notifications</p>
          </button>
        </li>
        <li>
          <button @click.stop="openedPage = 'cart'; handleCloseAddressOutOfWizard()">
            <i data-feather="shopping-cart" />
            <p>Cart</p>
          </button>
        </li>
        <li>
          <button @click.stop="openedPage = 'purchases'; handleCloseAddressOutOfWizard()">
            <i data-feather="box" />
            <p>Purchases</p>
          </button>
        </li>
        <li>
          <button
            :disabled="Object.entries(userData).length === 0"
            @click.stop="openedPage = 'profile'; handleCloseAddressOutOfWizard()">
            <i data-feather="user" />
            <p>Profile</p>
          </button>
        </li>
      </ul>
    </nav>
    <section
      v-if="openedPage === 'profile' || openedPage === 'settings'"
      class="userPage__profile">
      <div
        class="picture"
        :style="`background-image: url(${userData.avatar})`">
        <input
          id="file"
          ref="file"
          type="file"
          name="file"
          @change="updateUserAvatar">
        <label for="file">Change photo</label>
      </div>
      <div class="info">
        <h4>{{ userData.display_name }}</h4>
      </div>
    </section>
    <template v-if="openedPage === 'profile'">
      <section class="userPage__buttons">
        <button disabled>
          <i
            data-feather="user-check"
            class="icon" />
          <span>Reviews</span>
        </button>
        <button @click.stop="openedPage = 'payment-methods'">
          <i
            data-feather="credit-card"
            class="icon" />
          <span>Payment methods</span>
        </button>
        <button @click.stop="openedPage = 'addresses'">
          <i
            data-feather="map-pin"
            class="icon" />
          <span>My addresses</span>
        </button>
        <button @click.stop="openedPage = 'settings'">
          <i
            data-feather="settings"
            class="icon" />
          <span>Settings</span>
        </button>
        <button @click="handleLogout">
          <i
            data-feather="log-out"
            class="icon" />
          <span>Log out</span>
        </button>
      </section>
    </template>
    <template v-else-if="openedPage === 'settings'">
      <UserSettings
        :user-data="userData"
        @updateUserData="updateUserData"
        @goBack="() => (openedPage = 'profile')" />
    </template>
    <template v-else-if="openedPage === 'addresses'">
      <UserAddresses
        @openSnackbar="$emit('openSnackbar', $event)"
        @goBack="() => (openedPage = 'profile')" />
    </template>
    <template v-else-if="openedPage === 'payment-methods'">
      <PaymentMethods
        @userHasPaymentMethod="userHasPaymentMethod = $event"
        :user-data="userData"
        @openSnackbar="$emit('openSnackbar', $event)"
        @goBack="() => (openedPage = 'profile')" />
    </template>
    <template v-else-if="openedPage === 'cart'">
      <UserCart
        :cart="cart"
        :cart-id="cartId"
        :user-logged-in="userLoggedIn"
        @openSnackbar="$emit('openSnackbar', $event)"
        @openAddressesPage="openedPage = 'addresses'"
        @removeOrder="$emit('removeOrder', $event)"
        @checkout="openedPage = 'checkout'"
        @openSignInPage="$emit('openSignInPage', $event)"
        @cartItemChanged="$emit('cartItemChanged')" />
    </template>
    <template v-else-if="openedPage === 'purchases'">
      <UserPurchases
        :purchases="purchases"
        @openSnackbar="$emit('openSnackbar', $event)"
        @addProductToCart="$emit('addProductToCart', $event)"
      />
    </template>
    <template v-else-if="openedPage === 'checkout'">
      <UserAddresses
        ref="outWizardAddressRef"
        v-show="showSeparateWizardAddress"
        mode="checkout"
        separate-actions
        :init-new="separateWizardAddressNew"
        :init-edit="separateWizardAddressEdit"
        :init-edit-data="separateWizardAddressEditData"
        @openSnackbar="$emit('openSnackbar', $event)"
        @goBack="() => (openedPage = 'profile')"

        @finish-action="
          showSeparateWizardAddress = false
          updateSeparateWizardAddressData()
        " />
      <form-wizard
        v-show="!showSeparateWizardAddress"
        title=""
        subtitle=""
        step-size="xs"
        ref="formWizardRef"
        color="#000">
        <tab-content title="Summary">
          <h3>Summary</h3>
          <h4>Items in cart</h4>
          <UserCart
            mode="checkout"
            :cart="cart"
            :cart-id="cartId"
            :user-logged-in="userLoggedIn"
            @openSnackbar="$emit('openSnackbar', $event)"
            @openAddressesPage="openedPage = 'addresses'"
            @removeOrder="$emit('removeOrder', $event)"
            @makePurchase="$emit('makePurchase', $event)"
            @cartItemChanged="$emit('cartItemChanged')" />
        </tab-content>
        <tab-content title="Address">
          <UserAddresses
            ref="inWizardAddressRef"
            mode="checkout"
            separate-actions
            @openSnackbar="$emit('openSnackbar', $event)"
            @goBack="() => (openedPage = 'profile')"
            @add-new="handleAddNewAddressInWizard"
            @edit="handleEditAddressInWizard" />
        </tab-content>
        <tab-content title="Payment">
          <PaymentRequest
              :options="paymentOptions"
              @paymentMethodChoosed="makePurchase"
              @buttonsAvailable="paymentRequestAvailable = true"
            />
          <PaymentMethods
            mode="checkout"
            :user-data="userData"
            :paymentRequestAvailable="paymentRequestAvailable"
            @userHasPaymentMethod="userHasPaymentMethod = $event"
            @openSnackbar="$emit('openSnackbar', $event)"
            @goBack="() => (openedPage = 'profile')" />
        </tab-content>

        <template
          slot="footer"
          slot-scope="props">
          <div class="userPage__wizard-footer">
            <wizard-button
              class="userPage__wizard-action"
              :style="props.fillButtonStyle"
              style="order: 2"
              @click.stop="props.activeTabIndex > 0 ? props.prevTab() : openedPage = 'cart'">
              Back
            </wizard-button>

            <wizard-button
              v-if="!props.isLastStep"
              class="userPage__wizard-action"
              :style="props.fillButtonStyle"
              style="order: 1"
              @click.stop="props.nextTab()">
              Next
            </wizard-button>

            <BlackButton
              v-else
              :disabled="!$store.state.userAddressId || !userHasPaymentMethod"
              class="userPage__checkoutButton"
              :inverted="true"
              :loading="purchaseInProgress"
              @click.native.stop="makePurchase(null)">
              <b>Buy</b>
              (<span
                v-for="currency in new Set(
                  cart.map(order => order.offering.currency)
                )"
                :key="currency">
                {{ handleCalcTotal(currency).toFixed(2) }} {{ currency }}</span>)
            </BlackButton>
          </div>

          <div class="buy-error-messages" v-if="$refs.formWizardRef && $refs.formWizardRef.activeTabIndex === 2 && (!$store.state.userAddressId || !userHasPaymentMethod)">
            <div class="buy-error-message" v-if="!$store.state.userAddressId">
              <img
                class="buy-error-message__icon"
                draggable="false"
                :src="AlertIcon"
                alt="icon"
              />
              <span>No default address selected</span>
            </div>
          </div>
        </template>
      </form-wizard>
    </template>
    <template v-else-if="openedPage === 'purchase-successfull'">
      <div style="text-align: center; margin-top: 20px">
        <img
          src="https://i.ibb.co/d5wv1mJ/sadfsadf.png"
          width="60">
        <h2>Thank you!</h2>
        <p>Your purchase id: {{ purchaseData.id }}</p>
        <p>We've sent you a confirmation on email.</p>
      </div>
    </template>
  </div>
</template>

<script>
import { FormWizard, TabContent } from 'vue-form-wizard'
import 'vue-form-wizard/dist/vue-form-wizard.min.css'

import BlackButton from '@/components/BlackButton.vue'
import httpClient from '@/services/httpClient'
import Feather from 'feather-icons'
import currencyList from '@/assets/currencyList.json'
import UserSettings from './UserPage/UserSettings.vue'
import UserAddresses from './UserPage/UserAddresses.vue'
import PaymentMethods from './UserPage/PaymentMethods.vue'
import UserCart from './UserPage/UserCart.vue'
import UserPurchases from './UserPage/UserPurchases.vue'
import PaymentRequest from './UserPage/PaymentRequest.vue'
import * as Sentry from '@sentry/vue'
import AlertIcon from '@/assets/exclamation.svg'
import { ST_PK, ALGOLIA_INDEX } from '@/config.js'
import parseSegmentProduct from '@/segmentProduct'

export default {
  name: 'UserPage',
  components: {
    UserSettings,
    UserAddresses,
    PaymentMethods,
    UserCart,
    UserPurchases,
    BlackButton,
    FormWizard,
    TabContent,
    PaymentRequest
  },
  props: {
    userData: Object,
    cartId: String,
    cart: Array,
    purchases: Array,
    cartPageOnLogin: Boolean
  },
  data () {
    const stripe = window.Stripe(ST_PK)

    return {
      stripe,
      AlertIcon,
      openedPage: 'profile',
      purchaseInProgress: false,
      userHasPaymentMethod: false,
      purchaseData: {},
      showSeparateWizardAddress: false,
      separateWizardAddressNew: false,
      separateWizardAddressEditData: {},
      separateWizardAddressEdit: false,
      paymentRequestAvailable: false
    }
  },
  computed: {
    userLoggedIn () {
      return Object.entries(this.userData).length > 0
    },
    paymentOptions () {
      return {
        country: 'GB', // country of stripe account, not client!
        currency: this.currency.toLowerCase(),
        total: {
          label: 'Total',
          amount: this.handleCalcTotal(this.currency, false)
        },
        requestPayerName: true,
        requestPayerEmail: true
      }
    },
    currency () {
      return this.cart[0].offering.currency
    }
  },
  mounted () {
    Feather.replace()

    if (this.cartPageOnLogin) {
      this.openedPage = 'cart'
    }

    if (this.$route.query && this.$route.query.sidebar) {
      if (!Array.isArray(this.$route.query.sidebar) && this.$route.query.sidebar === 'purchases') {
        this.openedPage = 'purchases'
      }
    }
  },
  updated () {
    Feather.replace()
  },
  methods: {
    handleLogout () {
      this.$emit('logout')
      this.$store.commit('updateUserLoginAction', 'loggedOut')
    },
    handleCalcTotal (currency, convertMajor = true) {
      let total = this.cart
        .filter((order) => order.offering.currency === currency)
        .map(
          (order) => {
            if (convertMajor) {
              return order.offering.quantity *
                this.getPrice(order.offering.price, order.offering.currency)
            } else {
              return order.offering.quantity * order.offering.price
            }
          }
        )
        .reduce((a, b) => a + b, 0)

      let shippingPrice = this.$store.state.freeShipping.shippingItem.price

      if (convertMajor) {
        shippingPrice = this.getPrice(
          shippingPrice,
          this.$store.state.freeShipping.shippingItem.currency
        )
      }

      if (!this.$store.state.freeShipping.canFreeShip) {
        total += shippingPrice
      }

      return total
    },
    handleAddNewAddressInWizard () {
      this.showSeparateWizardAddress = true
      this.separateWizardAddressNew = true
      this.separateWizardAddressEdit = false
    },
    handleEditAddressInWizard (data) {
      this.separateWizardAddressEditData = data
      this.showSeparateWizardAddress = true
      this.separateWizardAddressEdit = true
      this.separateWizardAddressNew = false
    },
    handleCloseAddressOutOfWizard () {
      this.showSeparateWizardAddress = false
      this.updateSeparateWizardAddressData()
    },
    updateSeparateWizardAddressData () {
      // update data
      if (this.$refs.inWizardAddressRef) this.$refs.inWizardAddressRef.getUserAddresses()
      if (this.$refs.outWizardAddressRef) {
        if (this.$refs.outWizardAddressRef.selectedAddressId) {
          this.$refs.inWizardAddressRef.selectedAddressId = this.$refs.outWizardAddressRef.selectedAddressId
        }
      }
      // reset
      this.separateWizardAddressEdit = false
      this.separateWizardAddressNew = false
      this.separateWizardAddressEditData = {}
    },
    updateUserData (newUserData) {
      this.$emit('updateUserData', newUserData)
    },
    async updateUserAvatar () {
      const file = this.$refs.file.files[0]
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (supportedTypes.includes(file.type) === false) {
        return 'Unsupported file type!'
      }
      const response = await httpClient.post('/blobs', file)
      const photoURL = response.data.uri
      httpClient.patch('/me', { avatar: photoURL })
      this.$emit('updateUserAvatar', photoURL)
    },
    async shippingHandler () {
      if (this.$store.state.freeShipping.canFreeShip) {
        // remove shipping fee
        if (
          this.cart.some(
            (item) => item.slug.includes('shipping-fee') ||
              item.name.toLowerCase() === 'shipping fee'
          )
        ) {
          await this.handleRemoveShippingFee()
        }
      } else {
        // check if shipping fee was not added already
        if (
          !this.cart.some(
            (item) => item.slug.includes('shipping-fee') ||
              item.name.toLowerCase() === 'shipping fee'
          )
        ) {
          // add shippinf fee
          await this.handleAddShippingFee()
        }
      }
    },
    async handleRemoveShippingFee () {
      try {
        // get item id
        const res = await httpClient.get(`/cart/${this.cartId}`)
        const targetItem = res.data.items.find(
          (item) => item.item_id === this.$store.state.freeShipping.shippingItem.id
        )
        if (targetItem) {
          this.$store.state.freeShipping.shippingItem.cart_item_id = targetItem.id
        }

        if (this.$store.state.freeShipping.shippingItem.cart_item_id) {
          await httpClient.delete(
            `/cart/${this.cartId}/item/${this.$store.state.freeShipping.shippingItem.cart_item_id}`
          )
          // temp
          const index = this.cart.findIndex(
            (item) => item.slug.includes('shipping-fee') ||
              item.name.toLowerCase() === 'shipping fee'
          )
          if (index !== -1) this.cart.splice(index, 1)
        }
      } catch (e) {
        console.log(e)
      }
    },
    async handleAddShippingFee () {
      if (!this.$store.state.freeShipping.shippingItem.offering) {
        // If shipping fee doesn't have an offsering - check if it has the price in itself
        if (this.$store.state.freeShipping.shippingItem.price) {
          this.$store.state.freeShipping.shippingItem.offering = {
            id: this.$store.state.freeShipping.shippingItem.id,
            price: this.$store.state.freeShipping.shippingItem.price,
            currency: this.$store.state.freeShipping.shippingItem.currency,
            quantity: this.$store.state.freeShipping.shippingItem.quantity, // We are then assuming that the desired quantity is 1 (offers, bookings)
            available_quantity: this.$store.state.freeShipping.shippingItem
              .available_quantity
          }
        } else {
          console.error("Shipping fee doesn't have an offering nor a price!")
          return
        }
      }

      this.$store.state.freeShipping.shippingItem.offering.quantity = 1
      const requestData = {
        item_id: this.$store.state.freeShipping.shippingItem.offering.id,
        quantity: 1
      }

      try {
        await httpClient.post(`/cart/${this.cartId}/item`, requestData)
        this.cart.push(this.$store.state.freeShipping.shippingItem)
      } catch (e) {
        console.log(e)
      }
    },
    async makePurchase (paymentRequestMethodEvent = null) {
      if (this.purchaseInProgress) return
      const cart = this.cart // without shipping
      const total = this.handleCalcTotal(cart[0].offering.currency)
      await this.shippingHandler()
      this.purchaseInProgress = true
      Sentry.captureMessage('Purchase init', { level: 'info' })
      httpClient
        .post('/purchase', {
          address: this.$store.state.userAddressId,
          alt_payment: paymentRequestMethodEvent !== null
        })
        .then(async (response) => {
          this.purchaseData = response.data
          if (paymentRequestMethodEvent) {
            const clientSecret = response.data.payments[0].client_secret
            await this.confirmPayment(clientSecret, paymentRequestMethodEvent)
          }
          console.log(JSON.stringify(response.data))
          Sentry.captureMessage('Purchase successfull', { level: 'info' })
          this.$emit('makePurchase', response.data)
          this.$emit('openSnackbar', {
            message: 'Purchase successfull!',
            type: 'info'
          })

          try {
            let shippingPrice = 0
            if (!this.$store.state.freeShipping.canFreeShip) {
              shippingPrice = this.getPrice(
                this.$store.state.freeShipping.shippingItem.price,
                this.$store.state.freeShipping.shippingItem.currency
              )
            }

            const orderCompletedData = {
              cart_id: this.cartId,
              order_id: response.data.id,
              total,
              currency: cart[0].offering.currency,
              shipping: shippingPrice,
              products: cart.map((item, index) => ({
                ...parseSegmentProduct(item),
                position: index + 1
              })),
              index: ALGOLIA_INDEX
            }
            console.log(JSON.stringify(orderCompletedData))
            Sentry.captureMessage('Purchase Segment event data ready', { level: 'info' })
            window.analytics.track('Order Completed', orderCompletedData)
          } catch (err) {
            console.log(JSON.stringify(err))
            Sentry.captureMessage('Purchase segment event catched error')
            Sentry.captureException(err)
          }
        })
        .catch((error) => {
          let message = error.response?.data?.message
          if (!message) message = 'Error while confirming the payment. Please refresh and try again.'
          console.log(JSON.stringify(error))
          Sentry.captureMessage('Purchase catched error')
          Sentry.captureException(error)
          this.$emit('openSnackbar', {
            message,
            type: 'error'
          })
        })
        .finally(() => {
          Sentry.captureMessage('Purchase finished')
          this.purchaseInProgress = false
          this.$forceUpdate()
        })
    },
    async confirmPayment (clientSecret, paymentMethodEvent) {
      const { paymentIntent, confirmError } = await this.stripe.confirmCardPayment(
        clientSecret,
        { payment_method: paymentMethodEvent.paymentMethod.id },
        { handleActions: false }
      )

      if (confirmError) {
        paymentMethodEvent.complete('fail')
        throw new Error('Payment confirmation fail')
      }

      paymentMethodEvent.complete('success')

      if (paymentIntent.status === 'requires_action') {
        const { error } = await this.stripe.confirmCardPayment(clientSecret)
        if (error) throw new Error('Payment confirmation fail')
      }
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return price / Math.pow(10, currencyList[currency].fractionSize)
    }
  }
}
</script>

<style lang="stylus">
.userpage__nav + div
  overflow-x: hidden
.userPage
  display block
  overflow-y auto
  padding-bottom 110px
  nav ul
    display flex
    align-items center
    justify-content space-between
    width 100%
    list-style-type none
    margin 0
    margin-top 15px
    padding 0
    padding-top 18px
    padding-bottom 18px
    border-top 1px solid #eee
    border-bottom 1px solid #eee
    button
      border none
      cursor pointer
      color black
      background white
      font-size 13px
      border-radius 5px
      transition-duration .2s
      &:hover
        opacity .5
      &:focus
        outline none
      p
        margin 8px 0 0 0
      .icon
        font-size 23px
      &[disabled]
        opacity .3
        cursor default
        &:hover
          opacity .3 !important
          cursor default
  &__profile
    width 100%
    padding 18px 0
    display flex
    align-items center
    border-bottom 1px solid #eee
    .picture
      position relative
      display inline-block
      width 70px
      background-color #eee
      height 70px
      border-radius 100px
      background-size cover
      background-position center
      margin-left 7px
      margin-right 15px
      &:hover
        label
          display flex
      input
        width 0.1px
        height 0.1px
        opacity 0
        overflow hidden
        font-family inherit
        position absolute
        z-index -1
      label
        display none
        position absolute
        left 0
        top 0
        width 100%
        height 100%
        align-items center
        justify-content center
        background rgba(0, 0, 0, .6)
        font-size 11px
        color white
        border-radius inherit
        padding 0 5px
        box-sizing border-box
        text-align center
        cursor pointer
    .info
      display inline-flex
      flex-direction column
      align-items flex-start
      justify-content space-around
      height 60px
      p
        font-size 14px
      p, h4
        margin 0
  &__buttons
    padding 20px 0
    button
      margin 0 0 20px 0
      display flex
      align-items center
      border none
      cursor pointer
      font-family inherit
      background white
      font-weight 400
      font-size 13px
      transition-duration .2s
      &:hover
        opacity .8
      &:focus
        outline none
      .icon
        width 26px
        font-size 23px
        margin-right 10px
  &__checkoutButton
    padding 10px 15px !important
    height 36px
    margin-left auto
  &__item // Used in cart and purchases!
    position relative
    // width 100%
    margin 17px 0
    display flex
    opacity 0
    align-items center
    justify-content flex-start
    animation-name reveal
    animation-duration 0.8s
    animation-fill-mode forwards
    animation-timing-function cubic-bezier(0.19 , 1, 0.22, 1)
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
      &:nth-child({i})
        animation-delay (i - 1) * 55ms
    p:nth-child(2)
      font-size 14px
    p, i
      padding 0
      margin 0
    i
      font-size 12px
      color #aaa
    p:last-child
      margin-left auto
      font-size 14px
    span
      margin-left 14px
      margin-right 14px
    input
      text-align center
      padding 3px 0
      margin-right 3px
      font inherit
      border-radius 5px
      border 1px solid #ddd
  &__photo // Used in cart and purchases!
    width 120px
    min-width 120px
    height 70px
    margin-right 23px
    overflow hidden
    @media only screen and (max-width: 400px) {
      margin-right 5px
    }
    img
      display block
      margin 0 auto
      height 100%
      object-fit contain
  &__wizard-footer
    display flex
    justify-content space-between
    align-items center
    flex-direction row-reverse
  &__wizard-action
    background-color: rgb(0, 0, 0);
    border-color: rgb(0, 0, 0);
    color: white;
    min-width 80px
    border-width: 2px;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 15px;
    text-align center
    cursor pointer

@keyframes reveal
  0%
    opacity 0
    transform translateY(24px)
  100%
    opacity 1
    transform translateY(2px)
.buy-error-messages
  margin-top 40px
.buy-error-message
  margin: 0
  margin-bottom 10px
  display flex
  align-items center
  background-color var(--color-grey)
  padding: 10px
  border-radius 4px
  line-height 1
  &__icon
    heigh 17px
    width 17px
    margin-right 5px
</style>
