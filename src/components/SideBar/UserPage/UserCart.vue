<template>
  <div class="userCart">
    <h4 v-if="mode !== 'checkout'">
      Your cart
    </h4>
    <p v-if="cart.length === 0">
      No items in cart yet.
    </p>
    <template v-else>
      <div
        v-for="(order, index) in cart"
        :key="order.offering.id"
        class="userPage__item">
        <template
          v-if="
            !(
              order.slug.includes('shipping-fee') ||
              order.name.toLowerCase() === 'shipping fee'
            )
          ">
          <div class="userPage__photo">
            <img :src="imgix(order.featured_picture, { height: 70 })">
          </div>
          <template
            v-if="
              order.item_type !== 'offer' &&
                order.item_type !== 'room' &&
                mode !== 'checkout'
            ">
            <button
              title="Remove one"
              aria-label="Remove one"
              class="userCart__quantityButton"
              :disabled="order.offering.quantity <= 1"
              @click="
                order.offering.quantity--
                updateOrderQuantity(order)
              ">
              -
            </button>
            <b>{{ order.offering.quantity }}</b>x
            <button
              title="Add one more"
              aria-label="Add one more"
              class="userCart__quantityButton"
              :disabled="
                order.offering.quantity >= order.offering.available_quantity
              "
              @click="
                order.offering.quantity++
                updateOrderQuantity(order)
              ">
              +
            </button>
          </template>
          <template v-else-if="order.item_type === 'offer'">
            <span>
              <p>
                {{ order.guests.adults }} adult{{
                  order.guests.adults > 1 ? 's' : ''
                }}
              </p>
              <i>{{ new Date(order['time-start']).toLocaleString() }}</i>
            </span>
          </template>
          <template v-else-if="order.item_type === 'room'">
            <span>
              <p>
                {{ order.guests.adults }} adult{{
                  order.guests.adults > 1 ? 's' : ''
                }}
              </p>
              <i>{{
                new Date(order.period.start).toLocaleString('en-GB', {
                  dateStyle: 'short',
                })
              }}
                -
                {{
                  new Date(order.period.end).toLocaleString('en-GB', {
                    dateStyle: 'short',
                  })
                }}</i>
            </span>
          </template>
          <span>
            <p>{{ order.offering.name }}</p>
            <i v-if="mode !== 'checkout'">
              <span
                style="text-decoration: line-through; color: red; margin: 0">{{
                  order.offering.compare_at_price &&
                    order.offering.compare_at_price > order.offering.price
                    ? `${getCurrencySymbol(order.offering.currency)} ${(
                      getPrice(
                        order.offering.compare_at_price,
                        order.offering.currency
                      ) * order.offering.quantity
                    ).toFixed(2)}`
                    : ''
                }}</span>
              {{
                order.offering
                  ? `${getCurrencySymbol(order.offering.currency)} ${(
                    getPrice(order.offering.price, order.offering.currency) *
                    order.offering.quantity
                  ).toFixed(2)}`
                  : 'Item not available'
              }}
            </i>
            <i v-else>x {{ order.offering.quantity }}</i>
          </span>
          <button
            v-if="mode !== 'checkout'"
            class="removeOrder"
            @click.stop="$emit('removeOrder', index)">
            <i data-feather="x" />
          </button>
        </template>
      </div>
      <div
        v-if="!$store.state.freeShipping.canFreeShip"
        class="shipping-fee">
        <div class="userPage__photo">
          <img :src="`${shippingItem.featured_picture}`">
        </div>
        <div
          class="shipping-fee__info"
          :class="{ 'shipping-fee__info--checkout': mode === 'checkout' }">
          <p>Shipping fee</p>
          <i
            v-for="currency in new Set(
              cart.map((order) => order.offering.currency)
            )"
            :key="currency">£ {{ handleCalcShippingFee(currency).toFixed(2) }}</i>
        </div>
      </div>
      <div
        v-if="mode !== 'checkout'"
        class="userCart__divider" />
      <PriceProgressBox
        v-if="mode !== 'checkout'"
        :current-price="priceBoxPrice"
        @can-checkout="(e) => (canCheckout = e)"
        @can-freeship="(e) => (canFreeship = e)" />
      <div
        v-if="mode !== 'checkout'"
        class="userCart__divider" />
      <div
        v-if="mode !== 'checkout'"
        class="userCart__total">
        <p>Total:</p>
        <span
          v-for="currency in new Set(
            cart.map((order) => order.offering.currency)
          )"
          :key="currency">{{ getCurrencySymbol(currency) }} {{ handleCalcTotal(currency) }}
          {{ totalPrice }}
        </span>
      </div>
      <div
        v-if="mode !== 'checkout' && !$store.state.freeShipping.canFreeShip"
        class="userCart__total">
        <p>Shipping fee:</p>
        <span>
          £ {{ handleCalcShippingFee().toFixed(2) }}
        </span>
      </div>
      <BlackButton
        v-if="mode !== 'checkout'"
        class="userCart__checkoutButton"
        style="color: white"
        :disabled="!canCheckout"
        @click.native.stop="handleCheckout">
        Checkout
      </BlackButton>
    </template>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import imgix from '@/services/imgix'
import Feather from 'feather-icons'
import currencyList from '@/assets/currencyList.json'
import BlackButton from '@/components/BlackButton.vue'
import PriceProgressBox from '@/components/SideBar/PriceProgressBox.vue'
import TruckIcon from '@/assets/truck-icon.png'
import parseSegmentProduct from '@/segmentProduct'

export default {
  name: 'UserCart',
  components: {
    BlackButton,
    PriceProgressBox
  },
  props: {
    cart: Array,
    cartId: String,
    mode: {
      type: String,
      default: ''
    },
    userLoggedIn: Boolean
  },
  data () {
    return {
      TruckIcon,
      canCheckout: true,
      canFreeship: this.$store.state.freeShipping.canFreeShip, // hack but needed in current codebase..
      priceBoxPrice: 0,
      totalPrice: 0,
      shippingItem: {}
    }
  },
  computed: {
    cartUpdated () {
      return this.$store.state.cartUpdated
    }
  },
  watch: {
    canFreeship () {
      this.$store.commit('updateFreeShipping', {
        canFreeShip: this.canFreeship,
        shippingItem: this.$store.state.freeShipping.shippingItem
      })
    },
    cartUpdated () {
      this.$forceUpdate()
    },
    totalPrice () {
      this.$store.commit('updateFreeShipping', {
        canFreeShip: this.canFreeship,
        shippingItem: this.$store.state.freeShipping.shippingItem
      })
    }
  },
  async mounted () {
    Feather.replace()
    // await this.shippingHandler()
    await this.fetchShippingFee()
    const currency = this.cart.length ? this.cart[0].offering.currency : 'USD'
    this.handleCalcTotal(currency)
    if (this.mode === 'checkout') {
      window.analytics.track('Checkout Started', {
        cart_id: this.cartId,
        value: this.totalPrice,
        currency,
        shipping: this.canFreeship ? 0 : this.handleCalcShippingFee(),
        products: this.cart.map((item, index) => ({
          ...parseSegmentProduct(item),
          position: index + 1
        }))
      }, {
        integrations: {
          'All': true,
          'Algolia': false
        }
      })
    } else {
      window.analytics.track('Cart Viewed', {
        cart_id: this.cartId,
        products: this.cart.map((item, index) => ({
          ...parseSegmentProduct(item),
          position: index + 1
        }))
      }, {
        integrations: {
          'All': true,
          'Algolia': false
        }
      })
    }
  },
  updated () {
    Feather.replace()
  },
  methods: {
    handleCheckout () {
      // check if user is logged in
      if (this.$store.state.userLoggedIn) {
        this.$emit('checkout')
      } else {
        // show notification for user to login
        this.$emit('openSignInPage', true)
      }
    },
    handleCalcShippingFee () {
      if (this.shippingItem.currency) {
        const shippingPrice = this.shippingItem.price /
          Math.pow(10, currencyList[this.shippingItem.currency].fractionSize)

        return shippingPrice
      }

      return 0
    },
    async fetchShippingFee () {
      // fetch shipping item
      const res = await httpClient.get('/item/shipping-fee')
      this.shippingItem = res.data
      this.shippingItem.featured_picture = TruckIcon

      this.$store.commit('updateFreeShipping', {
        canFreeShip: this.$store.state.freeShipping.canFreeShip,
        shippingItem: this.shippingItem
      })
    },
    async handleCleanCart () {
      // check to see if there are other items in the cart beside freeshio, if not remove freeship
      if (
        this.cart.every(
          (item) => item.slug.includes('shipping-fee') ||
            item.name.toLowerCase() === 'shipping fee'
        )
      ) {
        await this.handleRemoveShippingFee()
      }
    },
    handleCalcTotal (currency) {
      this.$emit('cartItemChanged')
      let total = this.cart
        .filter((order) => order.offering.currency === currency)
        .map(
          (order) => order.offering.quantity *
            this.getPrice(order.offering.price, order.offering.currency)
        )
        .reduce((a, b) => a + b, 0)

      let shippingPrice = 0
      // if (this.shippingItem.currency) {
      //   shippingPrice = this.shippingItem.price /
      //     Math.pow(10, currencyList[this.shippingItem.currency].fractionSize)
      // }

      this.priceBoxPrice = total

      if (total < 55) total += shippingPrice

      this.totalPrice = Number(total.toFixed(2))
    },
    updateOrderQuantity (order) {
      if (order.offering.quantity <= 0) {
        order.offering.quantity = 1
      }
      httpClient.patch(`/cart/${this.cartId}/item/${order.cart_item_id}`, {
        quantity: order.offering.quantity
      })
      this.$forceUpdate()
      this.$store.commit('cartUpdated')
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return price / Math.pow(10, currencyList[currency].fractionSize)
    },
    getCurrencySymbol (currency) {
      if (
        currencyList[currency] &&
        currencyList[currency].symbol &&
        currencyList[currency].symbol.grapheme
      ) {
        return currencyList[currency].symbol.grapheme
      }

      return currency
    },
    imgix
  }
}
</script>

<style scoped lang="stylus">
.userCart {
  button.removeOrder {
    border: none;
    margin-left: auto;
    padding: 0;
    height: 15px;
    margin-top: 3px;
    background: transparent;
    cursor: pointer;

    .feather {
      width: 15px;
      height: 15px;
      min-width: 15px;
      min-height: 15px;
      cursor: pointer;
    }
  }

  &__quantityButton {
    display: inline-block;
    margin: 0 9px;
    width: 25px;
    font-size: 14px;
    height: 25px;
    border-radius: 40px;
    border: 1px solid #ddd;
    cursor: pointer;
    color: black;
    background-color: transparent;
    transition: all 0.12s;

    &[disabled] {
      cursor: default;
      opacity: 0.3;

      &:hover {
        color: black;
      }
    }

    &:hover {
      color: #888;
    }

    &:active {
      opacity: 0.5;
    }
  }

  &__total {
    text-align: right;
    line-height: 7px;
    padding: 5px 0 5px 0;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    & p {
      margin: 10px 10px;
    }
  }

  &__divider {
    border-top: 1px solid #eee;
    margin-top: 30px;

    & + .userCart__total {
      margin-top: 10px;
    }
  }

  &__checkoutButton {
    margin: 20px auto 0 auto;
    float: right;
    animation: buttonColor 0s ease forwards;
    background-color #000 !important;
    color: #fff @important

    & p {
      color: #fff @important
    }

    &:hover {
      color: #fff @important
    }

    &[disabled] {
      color: #fff @important
    }
  }
}

.shipping-fee {
  display: flex;
  align-items: center;

  &__info {
    margin-left: 115px;

    &--checkout {
      margin-left: 15px;
    }

    & p {
      margin: 0;
      padding: 0;
    }

    & i {
      font-size: 12px;
      color: #aaa;
      margin-top: 10px;
      display: block;
    }
  }
}
</style>
