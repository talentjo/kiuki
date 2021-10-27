<template>
  <div class="paymentMethods">
    <h4 v-if="mode !== 'checkout' || editing">
      Payment methods
      <BlackButton
        v-if="paymentMethods.length > 0"
        :disabled="newMethodFormOpen"
        style="margin-left: 10px"
        @click.stop.native="newMethodFormOpen = true">
        <p>Add new</p>
      </BlackButton>
    </h4>
    <h4 v-else>
      {{ mode === 'checkout' && paymentRequestAvailable ? 'Or pay with card' : 'Payment methods' }}
      <span><a
        v-if="!editing"
        @click.stop="editing = true">Edit</a></span>
    </h4>
    <div
      v-if="newMethodFormOpen"
      class="paymentMethods__newCard">
      <h4>Add a card</h4>
      <label
        class="paymentMethods__label"
        for="cart-label">Name your payment method</label>
      <TextInput
        id="cart-label"
        v-model="cardDescription"
        class="paymentMethods__input" />
      <Card
        ref="stripe-card"
        class="stripe-card"
        :class="{ complete }"
        :stripe="stripe"
        :options="stripeOptions"
        @change="complete = $event.complete" />
      <BlackButton
        :loading="addingNewCard"
        style="margin-top: 12px"
        :disabled="!complete"
        @click.stop.native="addCard">
        <p>Add</p>
      </BlackButton>
      <BlackButton
        :border-less="true"
        style="margin-left: 15px"
        @click.stop.native="newMethodFormOpen = false">
        <p>Cancel</p>
      </BlackButton>
    </div>
    <div
      v-for="(paymentMethod, index) in paymentMethods.filter(pm =>
        mode === 'checkout' && !editing ? pm.is_default : pm
      )"
      :key="`paymentMethod_${paymentMethod.id}`"
      class="paymentMethods__paymentMethod">
      <i data-feather="credit-card" />
      <p>
        {{ paymentMethod.description }}&nbsp;&nbsp; •••• •••• ••••
        {{ paymentMethod.other_info.last4 }}
        <i v-if="paymentMethod.is_default">DEFAULT</i>
      </p>
      <BlackButton
        v-if="(mode !== 'checkout' || editing) && !paymentMethod.is_default"
        :border-less="true"
        @click.stop.native="$emit('userHasPaymentMethod', true); makePaymentMethodDefault(paymentMethod.id, index)">
        <p>Use it</p>
      </BlackButton>
      <br>
      <BlackButton
        v-if="mode !== 'checkout'"
        @click.stop.native="removePaymentMethod(paymentMethod.id, index)">
        <p>Remove</p>
      </BlackButton>
    </div>
    <i v-if="loading">Loading...<br></i>
    <BlackButton
      v-if="mode !== 'checkout'"
      style="margin-top: 12px"
      :border-less="true"
      @click.stop.native="$emit('goBack')">
      <p>Back</p>
    </BlackButton>
    <img
      src="@/assets/payment_methods.svg"
      style="margin-right: 10px; width: 100%; height: auto; display: block; margin-top: 20px;">
  </div>
</template>

<script>
import BlackButton from '@/components/BlackButton.vue'
import TextInput from '@/components/TextInput.vue'
import httpClient from '@/services/httpClient'
import { Card, createPaymentMethod } from 'vue-stripe-elements-plus'
import { ST_PK } from '@/config.js'
import Feather from 'feather-icons'

export default {
  name: 'PaymentMethods',
  components: {
    Card,
    BlackButton,
    TextInput
  },
  props: {
    userData: Object,
    mode: {
      type: String,
      default: ''
    },
    paymentRequestAvailable: Boolean
  },
  data () {
    return {
      editing: false,
      newMethodFormOpen: false,
      paymentMethods: [],
      cardDescription: 'My card',
      stripe: ST_PK,
      stripeOptions: {
        // Stripe elements options
        style: {
          base: {
            'color': '#000',
            'fontSize': '14px',
            'fontSmoothing': 'antialiased',
            '::placeholder': {
              color: '#777'
            }
          }
        }
      },
      complete: false,
      loading: true,
      addingNewCard: false
    }
  },
  mounted () {
    Feather.replace()
  },
  updated () {
    Feather.replace()
  },
  created () {
    this.getPaymentMethods()
  },
  methods: {
    async getPaymentMethods () {
      // Get user's current payment methods
      const response = await httpClient.get('/me/payment-methods')
      this.loading = false
      this.paymentMethods = response.data
      if (this.paymentMethods.length === 0) {
        this.editing = true
        this.newMethodFormOpen = true
      } else {
        if (this.paymentMethods.some(method => method.is_default)) {
          this.$emit('userHasPaymentMethod', true)
        }
      }
    },
    addCard () {
      if (this.addingNewCard) return
      this.addingNewCard = true
      // Add card as a payment method and send it to API
      createPaymentMethod('card', this.$refs['stripe-card'][0], {
        billing_details: {
          name: this.userData.name
        }
      })
        .then((response) => {
          const { paymentMethod } = response
          if (paymentMethod.card.exp_month < 10) {
            paymentMethod.card.exp_month = `0${paymentMethod.card.exp_month}`
          }
          const requestData = {
            pm_id: paymentMethod.id,
            type: paymentMethod.type,
            description: this.cardDescription,
            is_default: this.paymentMethods.length === 0,
            other_info: {
              last4: paymentMethod.card.last4,
              brand: paymentMethod.card.brand,
              exp:
                paymentMethod.card.exp_month +
                (`${paymentMethod.card.exp_year}`).substring(2)
            }
          }
          // We have all the info we need. We can send it to our API
          httpClient
            .post('/me/payment-method', requestData)
            .then((response) => {
              this.newMethodFormOpen = false
              this.addingNewCard = false
              this.paymentMethods.push(requestData)
              this.paymentMethods[this.paymentMethods.length - 1].id = response.data.id
              this.$emit('userHasPaymentMethod', true)
              this.$emit('openSnackbar', {
                message: 'Payment method added successfully',
                type: 'info'
              })
            })
            .catch((error) => {
              this.addingNewCard = false
              this.$emit('openSnackbar', {
                message: 'Error adding payment method',
                type: 'error'
              })
              console.log(error)
            })
        })
        .catch((error) => {
          this.addingNewCard = false
          this.$emit('openSnackbar', {
            message: 'Error adding payment method',
            type: 'error'
          })
          console.log(error)
        })
    },
    removePaymentMethod (id, index) {
      if (this.paymentMethods[index].is_default) {
        // user removed default payment method
        this.$emit('userHasPaymentMethod', false)
      }

      this.paymentMethods.splice(index, 1)
      httpClient
        .delete(`/me/payment-method/${id}`)
        .then((response) => {
          this.$emit('openSnackbar', {
            message: 'Payment method removed successfully',
            type: 'info'
          })
          if (this.paymentMethods.length === 0) {
            this.newMethodFormOpen = true
          }
        })
        .catch((error) => {
          this.$emit('openSnackbar', {
            message: 'Error removing payment method',
            type: 'error'
          })
          console.log(error)
        })
    },
    makePaymentMethodDefault (id, index) {
      for (const paymentMethod of this.paymentMethods) {
        paymentMethod.is_default = false
      }
      this.paymentMethods[index].is_default = true
      httpClient
        .patch(`/me/payment-method/${id}`, { is_default: true })
        .then((response) => {
          this.editing = false
          this.$emit('openSnackbar', {
            message: 'Default payment method updated',
            type: 'info'
          })
        })
        .catch((error) => {
          this.$emit('openSnackbar', {
            message: 'Error updating default payment method',
            info: 'error'
          })
          console.log(error)
        })
    }
  }
}
</script>

<style scope lang="stylus">
.stripe-card {
  width: 100%;
  transition-duration: 0.12s;
  padding: 12px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;

  &:hover {
    border-color: #ccc;
  }

  &:focus {
    border-color: dodgerblue;
  }
}

.paymentMethods {
  display: block;
  font-size: 14px;

  span {
    margin-left: 10px;
  }

  a {
    color: dodgerblue;
    cursor: pointer;
    font-size: 0.9em;
  }

  .complete {
    border: 1px solid green;
  }

  &__newCard, &__paymentMethod {
    padding: 12px 0;
    border-top: 1px solid #eee;
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

    h4 {
      margin: 0 0 12px 0;
    }

    i {
      margin: 0 10px;
      font-size: 12px;
      color: #aaa;
    }
  }

  &__paymentMethod {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .feather {
      margin-right: 10px;
    }

    button {
      margin-left: auto;
    }

    &:last-of-type {
      border-bottom: 1px solid #eee;
    }
  }

  button.goBack {
    display: inline-block;
    position: relative;
    margin-top: 20px;
    margin-left: 0;
    padding: 0;
    cursor: pointer;
    background: white;
    font: inherit;
    border: none;
  }
}

.paymentMethods {
  &__label {
    font-size: 14px;
    margin: 10px 0 5px 0;
    display: block;
  }

  &__input {
    input {
      margin: 0;
    }

    margin-bottom: 15px;
  }
}

@keyframes reveal {
  0% {
    opacity: 0;
    transform: translateY(22px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
