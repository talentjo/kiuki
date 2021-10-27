<template>
  <div class="orders">
    <section v-if="individualOrder">
      <template>
        <div>
          <h3 style="margin: 0; padding: 0; float: left">
            The order details are:
          </h3>
          <button
            class="links printButton"
            @click="printDetails">
            Print details
          </button>
          <table ref="orderDetails">
            <tr>
              <th colspan="2">
                ID
              </th>
              <th>Purchase ID</th>
              <th>Payment status</th>
              <th colspan="2">
                Created at
              </th>
              <th>Phone</th>
              <th colspan="5">
                Address
              </th>
            </tr>
            <tr>
              <td colspan="2">
                {{ order.id }}
              </td>
              <td>{{ order.origin }}</td>
              <td>{{ order.payment_status }}</td>
              <td colspan="2">
                {{ formatDate(order.created_at) }}
              </td>
              <td>{{ order.order_info.recipient.contact_phone }}</td>
              <td
                v-if="Object.keys(order.order_info.address).length !== 0"
                colspan="5">
                {{
                  order.order_info.address.house_number
                    ? order.order_info.address.house_number
                    : null
                }},
                {{
                  order.order_info.address.street_address
                    ? order.order_info.address.street_address
                    : null
                }},
                {{
                  order.order_info.address.city
                    ? order.order_info.address.city
                    : null
                }},
                {{
                  order.order_info.address.country
                    ? order.order_info.address.country
                    : null
                }},
                {{
                  order.order_info.address.postcode
                    ? order.order_info.address.postcode
                    : null
                }}
              </td>
              <td v-else>
                No address found
              </td>
            </tr>
            <tr>
              <th
                colspan="2"
                class="head"
              >
                Seller details:
              </th>
            </tr>
            <tr>
              <th
                class="avatar"
                colspan="2">
                Image
              </th>
              <th>Name</th>
              <th colspan="2">
                E-mail
              </th>
            </tr>
            <tr>
              <td
                class="avatar"
                colspan="2">
                <img
                  class="avatar"
                  :src="order.seller.image">
              </td>
              <td>{{ order.seller.name }}</td>
              <td colspan="2">
                {{ order.seller.email }}
              </td>
            </tr>
            <tr>
              <th
                colspan="2"
                class="head"
              >
                Buyer details:
              </th>
            </tr>
            <tr>
              <th
                class="avatar"
                colspan="2">
                Image
              </th>
              <th>Name</th>
              <th colspan="2">
                E-mail
              </th>
            </tr>
            <tr>
              <td
                class="avatar"
                colspan="2">
                <img
                  class="avatar"
                  :src="order.buyer.image">
              </td>
              <td>{{ order.buyer.name }}</td>
              <td colspan="2">
                {{ order.buyer.email }}
              </td>
            </tr>
            <tr>
              <th
                colspan="2"
                class="head"
              >
                Items bought:
              </th>
            </tr>
            <tr>
              <th colspan="2">
                Name
              </th>
              <th>Product type</th>
              <th colspan="2">
                Owner
              </th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
            <tr
              v-for="(item, index) in order.items"
              :key="index">
              <td colspan="2">
                {{ item.item.name }}
              </td>
              <td>{{ item.product_type }}</td>
              <td colspan="2">
                {{ order.seller.name }}
              </td>
              <td>{{ item.quantity }}</td>
              <td>{{ getPrice(item.price, currency) }}</td>
              <td>{{ item.currency }}</td>
              <td>
                <a
                  class="links"
                  :href="`https://veganbase.com/${item.item.slug}`">
                  View item
                </a>
              </td>
            </tr>
            <tr>
              <th colspan="2">
                Total:
                {{ getPrice(getTotal(order.items), currency) }} {{ currency }}
              </th>
            </tr>
            <tr>
              <th
                colspan="2"
                class="head"
              >
                Tracking:
              </th>
            </tr>
            <template v-if="order.tracking">
              <template
                v-for="parcel in order.tracking.parcels.parcels"
              >
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <tr>
                  <th colspan="10">
                    {{ parcel.tracking_code }}:
                  </th>
                </tr>
                <tr
                  v-for="event in parcel.tracking_events"
                  :key="event.update_id"
                >
                  <td colspan="2">
                    {{ formatDate(event.update_date, 'dd MMMM yyyy HH:mm:ss') }}
                  </td>
                  <td colspan="8">
                    {{ event.status_description }}
                  </td>
                </tr>
              </template>
            </template>
            <tr v-else>
              <td colspan="10">
                No tracking info available...
              </td>
            </tr>
          </table>
        </div>
      </template>
    </section>
    <section v-else>
      <template v-if="!loading">
        <div v-if="ordersReceived.length === 0">
          <h3 class="info-message">
            As a seller, you haven't received any orders yet.
          </h3>
        </div>
        <div v-else>
          <table>
            <tr>
              <th>ID</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Created</th>
              <th>Details</th>
            </tr>
            <tr
              v-for="(order, index) in ordersReceived"
              :key="index">
              <td>{{ order.id }}</td>
              <td>{{ order.buyer.name }}</td>
              <td>{{ order.seller.name }}</td>
              <td>{{ order.payment_status }}</td>
              <td>{{ getPrice(getTotal(order.items), order.items[0].currency) }} {{ order.items[0].currency }}</td>
              <td :title="formatDate(order.created_at, 'yyyy-MM-dd HH:mm:ss')">
                {{ formatDate(order.created_at) }}
              </td>
              <td>
                <router-link
                  class="links"
                  :to="`/account/order/${order.id}`">
                  Show more
                </router-link>
              </td>
            </tr>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import { format, addMinutes } from 'date-fns'
import currencyList from '@/assets/currencyList.json'
// import Tabs from '@/components/account/Tabs.vue'
// import Tab from '@/components/account/Tab.vue'

export default {
  name: 'Orders',
  // components: { Tabs, Tab },
  props: {
    individualOrder: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      id: this.$route.params.id,
      loading: false,
      order: {},
      ordersReceived: []
    }
  },
  computed: {
    userData () {
      return this.$store.getters.getUserData
    },
    isOrgPage () {
      const obj = this.$store.state.orgData
      if (typeof obj !== 'undefined' && obj !== null) {
        return !(Object.keys(obj).length === 0 && obj.constructor === Object)
      }
      return false
    },
    currency () {
      return this.order.items[0].currency
    }
  },
  created () {
    this.getOrders()
    this.getOrderById()
  },
  methods: {
    async getOrders () {
      this.loading = true

      if (this.isOrgPage) {
        // obtaining orders received (when the user is the seller or org data is present)
        const response = await httpClient.get(
          `/orders?seller=true${
            this.$store.state.orgData
              ? `&org=${this.$store.state.orgData.id}`
              : ''}`
        )
        this.ordersReceived = response.data
      }

      this.loading = false
    },
    async getOrderById () {
      if (this.individualOrder) {
        this.loading = true
        const response = await httpClient.get(`/order/${this.id}`)
        this.order = response.data
        const purchaseId = this.order.origin
        await httpClient.get(`/tracking/${purchaseId}`).then((response) => {
          this.order = { ...this.order, tracking: response.data }
        })
        this.loading = false
      }
    },
    formatDate (dateString, dateFormat = 'dd MMMM yyyy') {
      const date = new Date(dateString)
      return format(addMinutes(date, date.getTimezoneOffset()), dateFormat)
    },
    printDetails () {
      const detailsToPrint = this.$refs.orderDetails
      let htmlToPrint = '' +
        '<h4> Your order details are: </h4>' +
        '' +
        '<style type="text/css">' +
        'table th, table td {' +
        'padding: 10px 10px 10px 0;' +
        'text-align: left;' +
        'border-top 1px solid #ddd;' +
        '}' +
        '.avatar {' +
        'display: none;' +
        '}' +
        '</style>'
      htmlToPrint += detailsToPrint.outerHTML
      const newWin = window.open('')
      newWin.document.write(htmlToPrint)
      newWin.print()
      newWin.close()
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return (
        price / Math.pow(10, currencyList[currency].fractionSize)
      ).toFixed(2)
    },
    getTotal (items) {
      return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    }
  }
}
</script>

<style lang="stylus" scoped>
.orders {
  display: block;
  height: 100%;

  section {
    text-align: left;
    margin: 20px auto;
    width: 100%;
    max-width: 1100px;
    padding: 0 10px;
    line-height: 1.7em;

    h3 {
      color: #555;
    }
  }

  table {
    width: 100%;

    th, td {
      padding: 10px 10px 10px 0;
      margin: auto;
      text-align: left;

      &.head {
        font-size: 1.2em;
        padding-top: 20px;
      }
    }

    tr:nth-child(n+1) {
      border-top: 1px solid #ddd;
    }
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  .links {
    text-decoration: underline;
  }
}

.printButton {
  float: right;
  background: transparent;
  border: none;
  cursor: pointer;
}

.info-message {
  text-align: center;
}
</style>
