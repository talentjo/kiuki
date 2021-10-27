<template>
  <div class="userPurchases">
    <h4 v-if="purchases.length === 0">
      You don't have any purchases yet.
    </h4>
    <div v-if="openedPurchase.id">
      <div class="userPurchases__breadcrumb">
        <button @click.stop="closePurchase">
          <i
            data-feather="chevron-left"
            class="icon" />
        </button>
        <b>Purchase {{ openedPurchase.id }}</b>
      </div>
      <div
        v-if="
          openedPurchase.orders.length === 0 &&
            openedPurchase.bookings.length === 0
        "
        class="userPurchases__loading"
      >
        <i class="fal fa-spinner fa-spin" />
      </div>
      <br>
      <div>
        <strong>Tracking</strong>
      </div>
      <br>
      <div v-if="!openedPurchase.tracking || !openedPurchase.tracking.parcels">
        No tracking info yet.
      </div>
      <template v-if="openedPurchase.tracking && openedPurchase.tracking.parcels">
        <div
          v-for="(parcel, index) in openedPurchase.tracking.parcels.parcels"
          :key="index"
          class="userPurchases__parcel">
          <div
            class="userPurchases__parcelHeader order-details-collapser"
            @click="handleExpandOrder(parcel)">
            <p>
              <span>Tracking code: {{ parcel.tracking_code }}</span>
            </p>

            <div
              class="order-details-collapser__icon"
              :class="{
                'order-details-collapser__icon--open': parcel.expanded,
              }">
              <i
                data-feather="chevron-left"
                class="icon" />
            </div>
          </div>
          <collapse-transition>
            <ul
              v-if="parcel.expanded"
              class="userPurchases__parcel__events"
            >
              <li
                v-for="event in parcel.tracking_events.reverse()"
                :key="event.update_id"
                class="userPurchases__parcel__events__event"
              >
                <span>{{ event.status_description }}</span>
                <span class="userPurchases__parcel__events__event__date">
                  {{ new Date(event.update_date).toLocaleString('en-GB') }}
                </span>
              </li>
            </ul>
          </collapse-transition>
        </div>
      </template>
      <br>
      <div>
        <strong>Orders</strong>
      </div>
      <br>
      <div v-if="openedPurchase.orders.length === 0">
        No orders.
      </div>
      <div
        v-for="(order) in openedPurchase.orders"
        :key="`order_${order.id}`"
        class="userPurchases__order">
        <div
          class="userPurchases__orderHeader order-details-collapser"
          @click="handleExpandOrder(order)">
          <p>
            <span>Order ID: {{ order.id }}</span>
            <span>
              Payment status:
              <i>{{ order.payment_status }}</i>
            </span>
          </p>

          <div
            class="order-details-collapser__icon"
            :class="{
              'order-details-collapser__icon--open': order.expanded,
            }">
            <i
              data-feather="chevron-left"
              class="icon" />
          </div>
        </div>
        <collapse-transition>
          <div v-if="order.expanded">
            <BlackButton
              class="userPurchases__reorder"
              @click.native="reorder(order)"
            >
              Add products to cart
            </BlackButton>
            <div
              v-for="item in order.items"
              :key="`item_${item.id}`"
              class="userPage__item">
              <div v-if="item.realItem" class="userPage__photo">
                <img :src="imgix(item.realItem.featured_picture, { width: 70 })">
              </div>
              <b
                v-if="
                  !(
                    item.item.slug.includes('shipping-fee') ||
                    item.item.name.toLowerCase() === 'shipping fee'
                  )
                ">{{ item.quantity }}x</b>
              <span
                :class="{
                  userPage__shippingFee:
                    item.item.slug.includes('shipping-fee') ||
                    item.item.name.toLowerCase() === 'shipping fee',
                }">
                <p>{{ item.item.name }}</p>
                <i>
                  {{ getCurrencySymbol(item.currency) }}
                  {{ getPrice(item.price * item.quantity, item.currency).toFixed(2) }}
                </i>
              </span>
            </div>
            <div class="userPurchases__total">
              <p>Total:</p>
              <span>{{ getCurrencySymbol(order.items[0].currency) }}
                {{ getPrice(order.total, order.items[0].currency).toFixed(2) }}</span>
            </div>
          </div>
        </collapse-transition>
      </div>

      <br><b>Bookings</b><br><br>
      <div v-if="openedPurchase.bookings.length === 0">
        No bookings.
      </div>
      <div
        v-for="booking in openedPurchase.bookings"
        :key="`order_${booking.id}`"
        class="userPurchases__order">
        <div class="userPurchases__orderHeader">
          <p>
            Order ID: {{ booking.id }} &nbsp; Payment status:
            <i>{{ booking.payment_status }}</i>
          </p>
        </div>
        <div class="userPage__item">
          <div class="userPage__photo">
            <img :src="`${booking.itemData.featured_picture}?width=240`">
          </div>
          <span>
            <p>
              {{ booking.booking_info.other_info.guests.adults }} adult{{
                booking.booking_info.other_info.guests.adults > 1 ? 's' : ''
              }}
            </p>
            <i v-if="booking.booking_info.other_info['time-start']">{{
              new Date(
                booking.booking_info.other_info['time-start']
              ).toLocaleString()
            }}</i>
            <i
              v-else>{{
              new Date(
                booking.booking_info.other_info.period.start
              ).toLocaleString('en-GB', { dateStyle: 'short' })
            }}
              -
              {{
                new Date(
                  booking.booking_info.other_info.period.end
                ).toLocaleString('en-GB', { dateStyle: 'short' })
              }}</i>
          </span>
          <span>
            <p>{{ booking.itemData.name }}</p>
            <i>
              <span
                style="text-decoration: line-through; color: red; margin: 0">{{
                  booking.booking_info.compare_at_price &&
                    booking.booking_info.compare_at_price >
                    booking.booking_info.price
                    ? `${getPrice(
                      booking.booking_info.compare_at_price,
                      booking.booking_info.currency
                    ) * booking.booking_info.quantity} ${
                      booking.booking_info.currency
                    }`
                    : ''
                }}</span>
              {{
                booking.booking_info
                  ? `${getPrice(
                    booking.booking_info.price,
                    booking.booking_info.currency
                  ) * booking.booking_info.quantity} ${
                    booking.booking_info.currency
                  }`
                  : 'Item not available'
              }}
            </i>
          </span>
        </div>
      </div>
    </div>
    <template v-else>
      <div
        v-for="purchase in purchases"
        :key="`purchase_${purchase.id}`"
        class="userPurchases__purchase">
        <b>ID: {{ purchase.id }}
          <span
            v-show="purchase.isNew"
            class="userPurchases__badge">New</span></b>
        <p>Status: {{ purchase.status }}</p>
        <i>{{ new Date(purchase.created_at).toISOString().split('T')[0] }}</i>
        <button @click.stop="openPurchase(purchase.id)">
          <i
            data-feather="chevron-right"
            class="icon" />
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import currencyList from '@/assets/currencyList.json'
import Feather from 'feather-icons'
import BlackButton from '@/components/BlackButton.vue'
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import imgix from '@/services/imgix'
import format from 'date-fns/format'

export default {
  name: 'UserSettings',
  components: {
    CollapseTransition,
    BlackButton
  },
  props: {
    purchases: Array
  },
  data () {
    return {
      openedPurchase: {},
      imgix,
      loading: false,
      format
    }
  },
  mounted () {
    Feather.replace()
  },
  updated () {
    Feather.replace()
  },
  methods: {
    handleExpandOrder (order) {
      order.expanded = !order.expanded
      this.$forceUpdate()
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
    openPurchase (purchaseId) {
      // Convert productofferings from orders to items with offerings
      const loadOrderOfferings = (order) => {
        order.expanded = true
        order.total = 0
        // Real items are items that are not product offerings, but original product of product offerings.
        for (const item of order.items) {
          httpClient
            .get(`/item/${item.item.id}?links=is-offering-for`)
            .then((response) => {
              // Get linked product!
              const linkedProductId = response.data.links[0].target
              httpClient.get(`/item/${linkedProductId}`).then((response2) => {
                const linkedProduct = response2.data
                linkedProduct.offering = response.data
                linkedProduct.offering.quantity = item.quantity
                item.realItem = linkedProduct
                this.$forceUpdate()

                order.items.sort((a, b) => {
                  if (
                    a.item.slug.includes('shipping-fee') ||
                    a.item.name.toLowerCase() === 'shipping fee'
                  ) {
                    return 1
                  }

                  return 0
                })
              })
            })
          order.total += item.price * item.quantity
        }
      }

      const loadBooking = (booking) => {
        booking.itemData = {}
        httpClient.get(`/item/${booking.item_id}`).then((response) => {
          booking.itemData = response.data
          this.$forceUpdate()
        })
      }

      this.openedPurchase = { id: purchaseId, orders: [], bookings: [] }
      // First get all orders of the purchase
      httpClient.get(`/purchase/${purchaseId}/orders`).then((response) => {
        this.openedPurchase.orders = response.data
        for (const order of response.data) {
          loadOrderOfferings(order)
        }
      })
      // And then bookings
      httpClient.get(`/purchase/${purchaseId}/bookings`).then((response) => {
        this.openedPurchase.bookings = response.data
        for (const booking of response.data) {
          loadBooking(booking)
        }
      })

      httpClient.get(`/tracking/${purchaseId}`).then((response) => {
        this.openedPurchase.tracking = response.data
      })
    },
    closePurchase () {
      this.openedPurchase = {}
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return price / Math.pow(10, currencyList[currency].fractionSize)
    },
    reorder (order) {
      order.items.map(async (item) => {
        if (item.item.slug.includes('shipping-fee')) return
        if (item.item.name.toLowerCase() === 'shipping fee') return
        if (item.realItem.offering.available_quantity === 0) {
          this.$emit('openSnackbar', {
            message: `Sorry, item "${item.realItem.offering.name}" is not in stock right now`,
            type: 'warning'
          })
          return
        }

        item.realItem.offering.quantity = item.quantity
        if (item.realItem.offering.quantity > item.realItem.offering.available_quantity) {
          item.realItem.offering.quantity = item.realItem.offering.available_quantity
        }

        this.$emit('addProductToCart', item.realItem)
      })
    }
  }
}
</script>

<style scoped lang="stylus">
.userPurchases {
  &__breadcrumb {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 8px 0;

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      height: 23px;
    }
  }

  &__badge {
    margin-left: 2px;
    padding: 2px 4px;
    font-weight: 400;
    border-radius: 2px;
    font-size: 11px;
    background: #bbffc1;
  }

  &__order,
  &__parcel {
    position: relative;
    width: 100%;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    margin-bottom: 15px;
  }

  &__parcel__events {
    padding-left: 35px;
    padding-bottom: 10px;
    margin: 0;
    list-style-type: disc;

    &__event {
      padding: 8px 0;

      &__date {
        font-style: italic;
        color: #888;
        display: block;
        margin-top: 5px;
      }
    }
  }

  &__reorder {
    margin-left: 7px;
    margin-bottom: 10px;
    margin-top: 0;
    background: #fff;
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

  &__orderHeader,
  &__parcelHeader {
    margin-left: 8px;
    margin-bottom: 20px;

    p {
      margin: .25rem 0;

      span {
        display: inline-block;
        margin: .25rem .5rem .25rem 0;
      }
    }
  }

  &__purchase {
    position: relative;
    width: 100%;
    border-bottom: 1px solid #eee;
    padding: 15px 0;
    line-height: 5px;
    opacity: 0;
    animation-name: reveal;
    animation-duration: 0.7s;
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);

    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 {
      &:nth-child({i}) {
        animation-delay: (i - 1) * 38ms;
      }
    }

    h3 {
      margin: 0;
    }

    i {
      color: #888;
    }

    button {
      position: absolute;
      border: none;
      height: 24px;
      top: calc(50% - 12px);
      right: 0;
      background: none;
      font-size: 20px;
      padding: 0;
      cursor: pointer;

      &:active {
        opacity: 0.5;
      }
    }
  }

  &__loading {
    font-size: 2rem;
    text-align: center;
    margin: 1rem;
  }
}

.userPage__shippingFee {
  margin-left: 30px !important;
}

.order-details-collapser {
  cursor: pointer;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__icon {
    font-size: 10px;
    transform: rotate(-90deg);
    transition: all 0.2s ease-in-out;
    margin-bottom: auto;
    margin-top: .25rem;

    & svg {
      height: 20px;
      width: autp;
    }

    &--open {
      transform: rotate(90deg);
    }
  }
}
</style>
