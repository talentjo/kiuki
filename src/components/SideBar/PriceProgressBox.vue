<template>
  <div
    class="price-progress-box"
    :class="{ 'price-progress-box--crossed': canCheckout }">
    <div
      class="price-progress-box__bar"
      :style="{ width: progress + '%' }" />
    <span
      v-if="showTitle"
      class="price-progress-box__title">
      {{ titleText }}
    </span>
    <div class="price-progress-box__subtitle">
      <span v-if="canFreeship">
        Free Shipping
      </span>
      <span
        v-else
        v-html="subtitleText" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceProgressBox',
  props: {
    minPrice: {
      type: Number,
      default: 30
    },
    currentPrice: {
      type: Number,
      default: 0
    },
    freeShipping: {
      type: Number,
      default: 55
    }
  },
  data: () => ({
    canCheckout: true,
    canFreeship: false,
    progress: 0,
    gapPrice: 0,
    showTitle: true,
    titleText: '',
    subtitleText: ''
  }),
  watch: {
    currentPrice () {
      this.handleCalcProgress()
    }
  },
  mounted () {
    this.handleCalcProgress()
  },
  methods: {
    handleCalcProgress () {
      if (this.currentPrice < this.minPrice) {
        // still not reached min checkout
        // this.canCheckout = false
        this.canCheckout = true
        this.canFreeship = false
        this.showTitle = true
        this.$emit('can-checkout', false)
        this.$emit('can-freeship', false)

        this.progress = (this.currentPrice / this.minPrice) * 100
        this.gapPrice = parseFloat(
          (this.minPrice - this.currentPrice).toFixed(2)
        )
        this.titleText = `You need to reach our minimum spend of £${this.minPrice}`
        this.subtitleText = `Spend just <strong>£${this.gapPrice}</strong> more 😃`
      } else {
        // reached min checkout
        this.canCheckout = true
        this.canFreeship = false
        this.showTitle = false
        this.$emit('can-checkout', true)
        this.$emit('can-freeship', false)

        this.progress = (this.currentPrice / this.freeShipping) * 100
        this.gapPrice = parseFloat(
          (this.freeShipping - this.currentPrice).toFixed(1)
        )
        this.subtitleText = `Spend just <strong>£${this.gapPrice}</strong> more for FREE Shipping`
        if (this.currentPrice >= this.freeShipping) {
          this.canFreeship = true
          this.$emit('can-freeship', true)
          this.titleText = "You're eligible for FREE SHIPPING!"
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.price-progress-box {
  border-radius: 10px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  position: relative;
  overflow: hidden;

  &__bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background-color: var(--color-red);
    opacity: 0.1;
    z-index: 1;
    max-width: 100%;
    transition: width 0.2s ease-in-out;
  }

  &__title {
    margin-bottom: 10px;
    color: var(--color-blue);
    font-weight: bold;
    font-size: 15px;
    z-index: 2;
  }

  &__subtitle {
    font-size: 16px;
    z-index: 2;
  }

  &--crossed {
    border-color: var(--color-green);

    .price-progress-box__bar {
      background-color: var(--color-green);
    }

    .price-progress-box__title {
      color: var(--color-green);
    }
  }
}
</style>
