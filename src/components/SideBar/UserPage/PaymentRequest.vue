<template>
  <div ref="container" />
</template>

<script>
import { ST_PK } from '@/config.js'

export default {
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data () {
    const stripe = window.Stripe(ST_PK)

    return {
      stripe: stripe,
      elements: stripe.elements(),
      paymentRequest: stripe.paymentRequest(this.options)
    }
  },
  methods: {
    mountButtons () {
      this.elements
        .create('paymentRequestButton', { paymentRequest: this.paymentRequest })
        .mount(this.$refs.container)
    }
  },
  mounted () {
    this.paymentRequest.canMakePayment().then((available) => {
      if (available) {
        this.mountButtons()
        this.$emit('buttonsAvailable')
      }
    })
    this.paymentRequest.on('token', event => this.$emit('tokenReceived', event))
    this.paymentRequest.on('paymentmethod', event => this.$emit('paymentMethodChoosed', event))
  }
}
</script>
