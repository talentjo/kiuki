<template>
  <div class="bookings">
    <section v-if="individualBooking">
      <template>
        <div>
          <h3 style="margin: 0; padding: 0; float: left">
            The booking details are:
          </h3>
          <button
            class="links printButton"
            @click="printDetails">
            Print details
          </button>
          <table ref="bookingDetails">
            <tr>
              <th colspan="2">
                Booking ID
              </th>
              <th>Purchase ID</th>
              <th>Payment status</th>
              <th colspan="3">
                Created at
              </th>
            </tr>
            <tr>
              <td colspan="2">
                {{ booking.id }}
              </td>
              <td>{{ booking.origin }}</td>
              <td>{{ booking.payment_status }}</td>
              <td colspan="3">
                {{ formatDate(booking.created_at) }}
              </td>
            </tr>
            <tr>
              <th colspan="2">
                Host details:
              </th>
            </tr>
            <tr>
              <th
                class="avatar"
                colspan="2">
                Image
              </th>
              <th>Name</th>
              <th colspan="3">
                E-mail
              </th>
            </tr>
            <tr>
              <td
                class="avatar"
                colspan="2">
                <img
                  class="avatar"
                  :src="booking.host.image">
              </td>
              <td>{{ booking.host.name }}</td>
              <td colspan="3">
                {{ booking.host.email }}
              </td>
            </tr>
            <tr>
              <th colspan="2">
                Customer details:
              </th>
            </tr>
            <tr>
              <th
                class="avatar"
                colspan="2">
                Image
              </th>
              <th>Name</th>
              <th colspan="3">
                E-mail
              </th>
            </tr>
            <tr>
              <td
                class="avatar"
                colspan="2">
                <img
                  class="avatar"
                  :src="booking.buyer.image">
              </td>
              <td>{{ booking.buyer.name }}</td>
              <td colspan="3">
                {{ booking.buyer.email }}
              </td>
            </tr>
            <tr>
              <th colspan="2">
                Booking details:
              </th>
            </tr>
            <tr>
              <th colspan="2">
                Name
              </th>
              <th v-if="booking.booking_info.other_info.guests">
                Adults
              </th>
              <th v-if="booking.booking_info.other_info.guests">
                Children
              </th>
              <th v-if="booking.booking_info.other_info.guests">
                Infants
              </th>
              <th colspan="2">
                Host
              </th>
              <th>Quantity</th>
              <th
                v-if="booking.booking_info.other_info.time_start"
                colspan="2">
                Time start
              </th>
              <th
                v-if="booking.booking_info.other_info.period"
                colspan="2">
                Period
              </th>
              <th>Price</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
            <tr>
              <td colspan="2">
                {{ booking.item.name }}
              </td>
              <td v-if="booking.booking_info.other_info.guests">
                {{
                  booking.booking_info.other_info.guests.adults
                    ? booking.booking_info.other_info.guests.adults
                    : 0
                }}
              </td>
              <td v-if="booking.booking_info.other_info.guests">
                {{
                  booking.booking_info.other_info.guests.children
                    ? booking.booking_info.other_info.guests.children
                    : 0
                }}
              </td>
              <td v-if="booking.booking_info.other_info.guests">
                {{
                  booking.booking_info.other_info.guests.infants
                    ? booking.booking_info.other_info.guests.infants
                    : 0
                }}
              </td>
              <td colspan="2">
                {{ booking.host.name }}
              </td>
              <td>
                {{ booking.booking_info.quantity }}
              </td>
              <td
                v-if="booking.booking_info.other_info.time_start"
                colspan="2">
                {{
                  format(
                    new Date(booking.booking_info.other_info.time_start),
                    'dd MMMM yyyy hh:mm a'
                  )
                }}
              </td>
              <td
                v-if="booking.booking_info.other_info.period"
                colspan="2">
                {{ formatDate(booking.booking_info.other_info.period.start) }} -
                {{ formatDate(booking.booking_info.other_info.period.end) }}
              </td>
              <td>
                {{ booking.booking_info.price }}
              </td>
              <td>
                {{ booking.booking_info.currency }}
              </td>
              <td>
                <a
                  class="links"
                  :href="`https://veganbase.com/${booking.item.slug}`">
                  View item
                </a>
              </td>
            </tr>
          </table>
        </div>
      </template>
    </section>
    <section v-else>
      <template v-if="!loading">
        <Tabs>
          <Tab
            title="Your bookings"
            :selected="true">
            <div v-if="bookingsDone.length === 0">
              <h3 class="info-message">
                You haven't placed any bookings yet.
              </h3>
            </div>
            <div v-else>
              <div v-if="isOrgPage">
                <h3 class="info-message">
                  Due to the fact that you cannot place a booking as an
                  organisation, you're now seeing your bookings as a user.
                </h3>
              </div>
              <table>
                <tr>
                  <th>ID</th>
                  <th>Buyer</th>
                  <th>Host</th>
                  <th>Payment</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
                <tr
                  v-for="(booking, index) in bookingsDone"
                  :key="index">
                  <td>{{ booking.id }}</td>
                  <td>{{ booking.buyer.name }}</td>
                  <td>{{ booking.host.name }}</td>
                  <td>{{ booking.payment_status }}</td>
                  <td>{{ formatDate(booking.created_at) }}</td>
                  <td>
                    <router-link
                      class="links"
                      :to="`/account/booking/${booking.id}`">
                      Show more
                    </router-link>
                  </td>
                </tr>
              </table>
            </div>
          </Tab>

          <Tab
            title="Bookings received"
            :selected="true">
            <div v-if="bookingsReceived.length === 0">
              <h3 class="info-message">
                As a host, you haven't received any bookings yet.
              </h3>
            </div>
            <div v-else>
              <table>
                <tr>
                  <th>ID</th>
                  <th>Buyer</th>
                  <th>Host</th>
                  <th>Payment</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
                <tr
                  v-for="(booking, index) in bookingsReceived"
                  :key="index">
                  <td>{{ booking.id }}</td>
                  <td>{{ booking.buyer.name }}</td>
                  <td>{{ booking.host.name }}</td>
                  <td>{{ booking.payment_status }}</td>
                  <td>{{ formatDate(booking.created_at) }}</td>
                  <td>
                    <router-link
                      class="links"
                      :to="`/account/booking/${booking.id}`">
                      Show more
                    </router-link>
                  </td>
                </tr>
              </table>
            </div>
          </Tab>
        </Tabs>
      </template>
    </section>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import format from 'date-fns/format'
import Tabs from '@/components/account/Tabs.vue'
import Tab from '@/components/account/Tab.vue'

export default {
  name: 'Bookings',
  components: { Tabs, Tab },
  props: {
    individualBooking: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      id: this.$route.params.id,
      loading: false,
      booking: {},
      bookingsDone: [],
      bookingsReceived: [],
      bookingss: [
        {
          id: 'QGP-807612',
          origin: 'SCP-616730',
          host: {
            id: 'usr_YAFG9yaQnqOpHfno',
            name: 'Charles S',
            email: 'rob@gmail.com',
            image: 'https://img-staging.veganlogin.com/OqTca4pfV9mj7kSy.jpg'
          },
          buyer: {
            id: 'usr_fRQT7GhKs78g4bJk',
            name: 'rob@gmail.com',
            email: 'rob@gmail.com',
            image: 'https://img-staging.veganlogin.com/avatar-36.png'
          },
          item: {
            id: 'pof_lx9a5qgdhALlZBJV',
            slug: 'testesdfsdf',
            name: 'testesdfsdf'
          },
          payment_status: 'pending',
          booking_info: {
            quantity: 3,
            price: 100,
            currency: 'PLN',
            other_info: {
              'guests': {
                adults: 1,
                children: 1,
                infants: 1
              },
              'period': {
                end: '2020-01-02',
                start: '2019-12-31'
              },
              'time-start': '2019-12-31T00:00:00.000000Z'
            }
          },
          created_at: '2019-11-08T01:09:49.092352Z'
        },
        {
          id: 'QGP-807612',
          origin: 'SCP-616730',
          host: {
            id: 'usr_YAFG9yaQnqOpHfno',
            name: 'Charles S',
            email: 'rob@gmail.com',
            image: 'https://img-staging.veganlogin.com/OqTca4pfV9mj7kSy.jpg'
          },
          buyer: {
            id: 'usr_fRQT7GhKs78g4bJk',
            name: 'rob@gmail.com',
            email: 'rob@gmail.com',
            image: 'https://img-staging.veganlogin.com/avatar-36.png'
          },
          item: {
            id: 'pof_lx9a5qgdhALlZBJV',
            slug: 'testesdfsdf',
            name: 'testesdfsdf'
          },
          payment_status: 'pending',
          booking_info: {
            quantity: 3,
            price: 100,
            currency: 'PLN',
            other_info: {
              'guests': {
                adults: 1
              },
              'period': {
                end: '2020-01-02',
                start: '2019-12-31'
              },
              'time-start': '2019-12-31T00:00:00.000000Z'
            }
          },
          created_at: '2019-11-08T01:09:49.092352Z'
        }
      ],
      bookingg: {
        id: 'QGP-807612',
        origin: 'SCP-616730',
        host: {
          id: 'usr_YAFG9yaQnqOpHfno',
          name: 'Charles S',
          email: 'rob@gmail.com',
          image: 'https://img-staging.veganlogin.com/OqTca4pfV9mj7kSy.jpg'
        },
        buyer: {
          id: 'usr_fRQT7GhKs78g4bJk',
          name: 'rob@gmail.com',
          email: 'rob@gmail.com',
          image: 'https://img-staging.veganlogin.com/avatar-36.png'
        },
        item: {
          id: 'pof_lx9a5qgdhALlZBJV',
          slug: 'testesdfsdf',
          name: 'testesdfsdf'
        },
        payment_status: 'pending',
        booking_info: {
          quantity: 3,
          price: 100,
          currency: 'PLN',
          other_info: {
            'guests': {
              adults: 1,
              children: 1,
              infants: 1
            },
            'period': {
              end: '2020-01-02',
              start: '2019-12-31'
            },
            'time-start': '2019-12-31T00:00:00.000000Z'
          }
        },
        created_at: '2019-11-08T01:09:49.092352Z'
      }
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
    }
  },
  created () {
    this.getBookings()
    this.getBookingById()
  },
  methods: {
    async getBookings () {
      this.loading = true

      if (this.isOrgPage) {
        // obtaining bookings received (when the user is the host or org data is present)
        const response = await httpClient.get(
          `/bookings?host=true${
            this.$store.state.orgData
              ? `&org=${this.$store.state.orgData.id}`
              : ''}`
        )
        this.bookingsReceived = response.data
      }

      const response2 = await httpClient.get('/bookings')
      this.bookingsDone = response2.data

      this.loading = false
    },
    async getBookingById () {
      if (this.individualBooking) {
        this.loading = true
        const response = await httpClient.get(`/booking/${this.id}`)
        this.booking = response.data
        this.loading = false
      }
    },
    formatDate (date) {
      return format(new Date(date), 'dd MMMM yyyy')
    },
    printDetails () {
      const detailsToPrint = this.$refs.bookingDetails
      let htmlToPrint = '' +
        '<h4> Your booking details are: </h4>' +
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.bookings
  display block
  height 100%
  section
    text-align left
    margin 20px auto
    width 100%
    max-width 1100px
    padding 0 10px
    line-height 1.7em
    h3
      color #555
  table
    width 100%
    th, td
      padding 10px 10px 10px 0
      margin auto
      text-align left
    tr:nth-child(n+1)
      border-top 1px solid #ddd
  .avatar
    width 50px
    height 50px
    border-radius 50%
  .links
    text-decoration underline
.printButton
  float right
  background transparent
  border none
  cursor pointer
.info-message
  text-align: center
</style>
