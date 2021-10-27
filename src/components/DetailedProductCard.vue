<template>
  <div class="detailedProductCard">
    <PictureDisplayer :pictures="productData.pictures || []" />
    <div v-if="productData" class="detailedProductCard__description">
      <h1>{{ productData.name }}</h1>
      <div v-if="restaurant">
        <h2 style="text-transform: uppercase; margin-top: 0.5rem;">{{ `restaurant in ${productData.address.street_address} - ${productData.address.city}` }}</h2>
      </div>
      <div v-else>
        <router-link
        :to="`/brand/${
          productData.owner && productData.owner.slug
            ? productData.owner.slug
            : ''
        }/`"
      >
        <h2>
          {{
            productData.owner && productData.owner.name
              ? productData.owner.name
              : ''
          }}
        </h2>
        </router-link>
      </div>

      <div class="detailedProductCard__tags">
        <router-link
          v-bind:key="`/tag/${tag}/`"
          v-for="tag in productData.tags"
          class="detailedProductCard__tag"
          :to="`/tag/${tag}/`"
        >
          {{ `#${tag}` }}
        </router-link>
      </div>
      <!-- <h4 v-if="productData.offerings && productData.offerings.length > 0">
        Available from:
      </h4> -->
      <button
        class="detailedProductCard__transparentButton detailedProductCard__actionCounter"
        :class="{ 'detailedProductCard__actionCounter--liked': productData.user_upvoted }"
        :disabled="!$store.getters.isUserLoggedIn"
        :title="
          $store.getters.isUserLoggedIn
            ? 'Love it'
            : 'Please log in to give it some love'
        "
        @click="likeProduct()">
        <i
          class="fa-heart"
          :class="productData.user_upvoted ? 'fas likeAnimation' : 'fal'" />
        <div class="detailedProductCard__likeCounter">
          <p>{{ productData.upvotes ? productData.upvotes : 0 }}</p>
        </div>
      </button>
      <div
        v-for="offering in productData.offerings"
        :key="offering.id"
        class="offering"
      >
        <span>{{ offering.name }} -</span
        ><span
          style="text-decoration: line-through; margin: 0 5px; font-size: 0.8em"
          >{{
            offering.compare_at_price > offering.price
              ? `${getCurrencySymbol(offering.currency)} ${getPrice(
                  offering.compare_at_price,
                  offering.currency,
                )}`
              : ''
          }}</span
        ><span
          ><b
            >{{ getCurrencySymbol(offering.currency) }}
            {{ getPrice(offering.price, offering.currency) }}
          </b></span
        >
        <div class="offering-break" />
        <button
          v-if="
            productData.item_type !== 'article' &&
            productData.item_type !== 'post' &&
            !getCartOrderForOffering(offering)
          "
          :disabled="isOfferingOutOfStock(offering)"
          @click.stop="handleAddToCart(offering)"
          class="add-to-cart-button"
        >
          Add to Cart
        </button>
        <div
          v-if="getCartOrderForOffering(offering)"
          class="detailedProductCard__quantityButtonContainer"
        >
          <button
            title="Remove one"
            aria-label="Remove one"
            class="detailedProductCard__quantityButton"
            :disabled="getCartOrderForOffering(offering).offering.quantity <= 1"
            @click="
              getCartOrderForOffering(offering).offering.quantity--;
              updateOrderQuantity(offering);
            "
          >
            <span style="transform: translateY(-2px)">-</span>
          </button>
          <b class="detailedProductCard__quantity">{{
            getCartOrderForOffering(offering).offering.quantity
          }}</b
          >x
          <button
            title="Add one more"
            aria-label="Add one more"
            class="detailedProductCard__quantityButton"
            :disabled="isOfferingOutOfStock(offering)"
            @click="
              getCartOrderForOffering(offering).offering.quantity++;
              updateOrderQuantity(offering);
            "
          >
            <span>+</span>
          </button>
        </div>
        <div
          v-if="isOfferingOutOfStock(offering) && !getCartOrderForOffering(offering)"
          class="out-of-stock-badge">
            Out of Stock
        </div>
      </div>
      <div
        v-if="!restaurant && productData.offerings && !productData.offerings.length"
        class="out-of-stock-badge"
      >
        No offers available
      </div>
      <p class="detailedProductCard__descriptionTop">{{ productData.description }}</p>
    </div>
  </div>
</template>

<script>
// http://localhost:8085/item/plant-based-beef-tender-strips
// http://localhost:8085/item/pof_LE50gJBLe7rCNAP2?links=is-offering-for

import PictureDisplayer from '@/components/PictureDisplayer.vue'
import currencyList from '@/assets/currencyList.json'
import httpClient from '@/services/httpClient'

export default {
  name: 'DetailedProductCard',
  components: {
    PictureDisplayer
  },
  props: {
    productData: Object,
    restaurant: Boolean
  },
  computed: {
    cartUpdated () {
      return this.$store.state.cartUpdated
    }
  },
  watch: {
    cartUpdated () {
      this.$forceUpdate()
    }
  },
  methods: {
    isOfferingOutOfStock (offering) {
      if (offering.available_quantity === 0) return true
      const cartOrder = this.getCartOrderForOffering(offering)
      if (cartOrder) {
        return cartOrder.offering.quantity >= offering.available_quantity
      }
      return false
    },
    async updateOrderQuantity (offering) {
      const cardOrder = this.getCartOrderForOffering(offering)
      try {
        if (cardOrder.offering.quantity <= 0) {
          cardOrder.offering.quantity = 1
        }
        await httpClient.patch(
          `/cart/${this.$store.state.cartId}/item/${cardOrder.cart_item_id}`,
          {
            quantity: cardOrder.offering.quantity
          }
        )
        this.$forceUpdate()
        this.$store.commit('cartUpdated')
      } catch (e) {
        console.log(e)
      }
    },
    handleAddToCart (offering) {
      this.$emit('addProductToCart', {
        ...this.productData,
        offering
      })
    },
    getPrice (price, currency) {
      // Converts a price from minor currency units to major ones
      return (
        price / Math.pow(10, currencyList[currency].fractionSize)
      ).toFixed(2)
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
    getCartOrderForOffering (offering) {
      return this.$store.state.cart.find(item => item.offering.id === offering.id)
    },
    async likeProduct () {
      if (this.productData.user_upvoted) {
        try {
          this.productData.user_upvoted = false
          this.productData.upvotes--
          await httpClient.delete(`/item/${this.productData.id}/upvote`)
        } catch {
          this.productData.upvotes++
          this.productData.user_upvoted = true
        }
      } else {
        try {
          this.productData.user_upvoted = true
          this.productData.upvotes++
          await httpClient.post(`/item/${this.productData.id}/upvote`)
        } catch {
          this.productData.upvotes--
          this.productData.user_upvoted = false
        }
      }
    }
  }
}
</script>

<style scoped lang="stylus">
.detailedProductCard {
  display: inline-flex;
  background-color: white;
  border-radius: 30px;
  width: 100%;
  min-height: 100px;

  button:not(&__transparentButton) {
    background: transparent;
    padding: 0.25rem 0.75rem;
    border: none;
    margin-left: 15px;
    border-radius: 50px;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    background-color: var(--color-blue);
    color: #fff;

    @media screen and (max-width: 400px) {
      width: 100%;
      margin-left: 0;
      margin-top: 15px;
    }

    &[disabled] {
      cursor: default;
      border-color: #eee;
      color: #949494;
      background-color: #eee;
    }
  }

  &__quantityButtonContainer {
    line-height: 3rem !important
    display: flex;
    align-items: center;
  }

  &__quantityButton {
    height: 30px;
    width: 30px !important;
    font-size: 20px !important;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 10px !important;
    white-space: normal;
  }

  &__description {
    text-align: left;
    margin-left: 20px;

    h1 {
      font-size: 22px;
      font-weight: 400;
      margin-bottom: 0.5rem;
    }

    h2 {
      font-size: 15px;
      font-weight: 400;
      display: inline-block;
      margin-top: 0;
      margin-bottom: 0;
      color: #666;
    }

    h4 {
      font-weight: 100;
      margin-bottom: 0;
    }

    div {
      font-size: 14px;
      line-height: 1.2em;
      white-space: pre-line;
      max-width: 500px;

      &.offering {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        white-space: normal;

        .offering-break {
          flex-basis: 100%;
          margin-top: .5rem;
        }
      }
    }
  }

  &__tags {
    margin: 20px 0;
    display: flex;
    flex-wrap: wrap;
    width: 80%;
  }

  &__tag {
    font-size: 13px;
    color: var(--color-blue);
    margin-right: 8px;
    cursor: pointer;
  }
}

.out-of-stock-badge {
  background-color: #D44E5A;
  padding: 4px 11px;
  align-self: flex-start;
  font-size: 11px;
  color: #fff;
  border-radius: 5px;
  font-weight: bold;
  white-space: normal !important;
  margin: 10px 0px;
  display: inline-block;
  min-width: 150px;

  @media screen and (max-width: 779.98px) {
    width 100%
  }
}

.add-to-cart-button {
  padding: 0.55rem 0.75rem !important;
  margin-left: 0 !important;
  display: block !important;
  margin: .5rem;

  @media screen and (min-width: 980px) {
    order: -1;
  }
}

@media screen and (max-width: 779.98px) {
  .detailedProductCard {
    flex-direction: column;

    &__description {
      margin: 0;
    }
  }
}

@media screen and (max-width: 469.98px) {
  .detailedProductCard {
    padding: 12px;
  }
}

.detailedProductCard
  &__transparentButton
    background transparent
    padding 0
    border none
    font inherit
    color var(--color-red)
    &[disabled]
      cursor default
      color #eee
      i, p , span
        color #ccc
      cursor default
  &__actionCounter
    display flex !important
    align-items center
    margin-top: 20px;
    margin-bottom: 10px;
    cursor pointer
    & i,& p,& span
      color #555
    &:hover i, &:hover span, &:hover p
      color var(--color-red)
    & i
      font-size: 19px
    &:last-of-type
      margin-right: 0
    &--liked
      & i,& p,& span
        color var(--color-red)
      & .productCard__likeCounter
        p
          transform translateY(-100%)
  &__likeCounter
    &:hover
      color var(--color-red)
    margin-left 6px
    display inline-block
    width auto
    height 19px
    overflow hidden
    p
      margin 0
      line-height 1
      height 100%
      display: flex
      align-items center
      font-size 18px
      transform translateY(1px)
      transition 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
      padding 0
  &__descriptionTop
    white-space pre-wrap
</style>
