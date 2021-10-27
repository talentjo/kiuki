<template>
  <div
    class="productCard" v-bind:class="{ restaurantCard: restaurant, magazineCard: magazine }"
    @click="onProductClicked"
  >
    <router-link
      :to="
        isRecipe
          ? `/recipe/${product.slug}`
          : magazine
          ? `/mag/${product.slug}`
          : restaurant
          ? `/restaurant/${product.slug}`
          : `/${product.slug}`
      "
    >
      <div
        class="productCard__image"
        :style="{
          backgroundSize: `${magazine || restaurant ? 'cover' : ''}`,
          backgroundImage: `url(${imgix(product.pictures[0], {
            width: 242,
            height: 242,
          })})`,
        }"
      />
    </router-link>
    <div
      class="productCard__info"
      v-bind:class="{ restaurantCardInfo: restaurant }"
    >
      <router-link
        :to="
          isRecipe
            ? `/recipe/${product.slug}`
            : magazine
            ? `/mag/${product.slug}`
            : restaurant
            ? `/restaurant/${product.slug}`
            : `/${product.slug}`
        "
      >
        <h4>{{ trimmedName }}</h4>
      </router-link>

      <div class="productCard__location" v-if="restaurant">
        {{ `restaurant in ${product.address.street_address} - ${product.address.city}` }}
      </div>

      <div v-if="restaurant === false">
        <router-link
          :to="`/brand/${product.owner.slug}`"
          v-if="product.owner && product.owner.slug"
        >
          <h6>{{ product.owner.name }}</h6>
        </router-link>
        <h6 v-else>{{ product.owner.name }}</h6>
      </div>

      <div class="productCard__tags">
        <div
          v-bind:key="`/tag/${tag}/`"
          v-for="tag in product.tags"
          class="productCard__tag"
          @click="$router.push(`/tag/${tag}`)"
        >
          {{ "#" + tag }}
        </div>
      </div>
    </div>
    <div v-if="isOutOfStock && !shouldShowGrey" class="out-of-stock-badge">
      Out of Stock
    </div>
    <div v-if="offerings && offerings.length" class="productCard__price">
      <span
        style="text-decoration: line-through; margin: 0 5px; font-size: 1em"
      >
        {{
          offering.compare_at_price > offering.price
            ? `${getCurrencySymbol(offering.currency)} ${getPrice(
                offering.compare_at_price,
                offering.currency
              )}`
            : ""
        }}
      </span>
      <span>
        <strong
          >{{ getCurrencySymbol(offering.currency) }}
          {{ getPrice(offering.price, offering.currency) }}
        </strong>
      </span>
    </div>
    <div v-else-if="isProduct && !offerings" class="productCard__price loading">
      <i class="fal fa-spinner fa-spin" />
    </div>
    <div
      v-if="isProduct && offerings && !offerings.length"
      class="out-of-stock-badge"
    >
      No offers available
    </div>
    <div class="productCard__socialBottom">
      <span class="productCard__actions">
        {{ checkIsOutOfStock() }}
        <button
          v-if="isProductOffering()"
          class="productCard__transparentButton addToCartButton"
          title="Add to cart"
          :disabled="isOutOfStock"
          @click="addProductToCart"
        >
          <i class="fal fa-plus-circle" />
        </button>
        <button
          class="productCard__transparentButton productCard__actionCounter"
          disabled="disabled"
        >
          <i
            class="fa-heart"
            :class="product.user_upvoted ? 'fas likeAnimation' : 'fal'"
          />
          <div class="productCard__likeCounter">
            <p>{{ product.upvotes ? product.upvotes : 0 }}</p>
            <p>{{ product.upvotes ? product.upvotes : 0 }}</p>
          </div>
        </button>
        <button
          class="productCard__transparentButton productCard__actionCounter"
          :disabled="!$store.getters.isUserLoggedIn"
          :title="
            $store.getters.isUserLoggedIn
              ? 'Comment it'
              : 'Please log in to give it some love'
          "
        >
          <i class="fal fa-comments" /><span
            class="productCard__commentCounter"
            >{{ product.comments ? product.comments : 0 }}</span
          >
        </button></span
      >
    </div>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient.js'
import imgix from '@/services/imgix'
import currencyList from '@/assets/currencyList.json'
import parseSegmentProduct from '@/segmentProduct'

// A card of a product displayed on Home page.
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    restaurant: Boolean,
    magazine: Boolean
  },
  data () {
    return {
      isOffer: false,
      isOutOfStock: false,
      shouldShowGrey: false,
      offerings: null
    }
  },
  computed: {
    isRecipe () {
      if (this.product.item_type === 'recipe') {
        return true
      }
      return false
    },
    isProduct () {
      return this.product.item_type === 'packagedfood'
    },
    trimmedDescription () {
      if (this.product.description.length > 80) {
        return `${this.product.description.substring(0, 80)}...`
      }
      return this.product.description
    },
    trimmedName () {
      if (this.product.name.length > 37) {
        return `${this.product.name.substring(0, 37)}...`
      }
      return this.product.name
    },
    storeCart () {
      return this.$store.state.cart
    },
    offering () {
      return [...this.offerings].sort((a, b) =>
        a.price > b.price ? 1 : -1
      )[0] // cheapest
    }
  },
  mounted () {
    if (this.isProduct) this.getOfferings()
  },
  watch: {
    product: {
      handler () {
        this.checkIsOutOfStock()
      },
      deep: true
    },
    storeCart: {
      handler () {
        this.checkIsOutOfStock()
      },
      deep: true
    }
  },
  methods: {
    checkIsOutOfStock () {
      // find item in cart if exist
      const itemInCart = this.$store.state.cart.find(
        (item) => item.id === this.product.id
      )
      if (itemInCart) {
        this.isOutOfStock =
          itemInCart.offering &&
          itemInCart.offering.quantity >=
            itemInCart.offering.available_quantity

        if (!this.shouldShowGrey) {
          if (itemInCart.offering.available_quantity > 0) {
            this.shouldShowGrey = true
          }
        }
      } else if (this.offerings && this.offerings.length) {
        const offering = this.offering
        this.isOutOfStock = offering.available_quantity === 0

        if (!this.shouldShowGrey) {
          if (offering.available_quantity > 0) {
            this.shouldShowGrey = true
          }
        }
      }
    },
    isProductOffering () {
      if (this.offerings && this.offerings.length) {
        const offering = this.offering
        return offering.item_type === 'productoffering'
      }

      return false
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
    addProductToCart (element) {
      this.$emit('addProductToCart', {
        ...this.product,
        offering: this.offering
      })

      const button = element.target.parentElement
      button.classList.add('likeAnimation')
      setTimeout(() => {
        button.classList.remove('likeAnimation')
      }, 200)
    },
    getOfferings () {
      httpClient
        .get(
          `/item/${this.product.id}/links?page=1&per_page=100&link_format=full`
        )
        .then((response) => {
          if (!response.data.length) {
            this.offerings = []
          }
          for (const link of response.data) {
            if (link.link_type === 'product-has-offerings') {
              httpClient.get(`/item/${link.target}`).then((response2) => {
                if (!this.offerings) this.offerings = []
                this.offerings.push(response2.data)
              })
            }
          }
        })
        .catch(() => {
          if (!this.offerings) this.offerings = []
        })
    },
    onProductClicked () {
      if (this.productAlreadyClicked) return
      this.productAlreadyClicked = true
      this.product.offering = this.offering
      window.analytics.track('Product Clicked', parseSegmentProduct(this.product))
    },
    imgix
  }
}
</script>

<style scoped lang="stylus">
.restaurantCard,
.magazineCard
  overflow hidden
  padding 0 0 20px 0 !important
.restaurantCardInfo
  padding: 10px 15px 5px 15px !important
.productCard
  display flex
  flex-direction column
  flex-shrink 0
  position relative
  margin 0 auto
  border-radius 2rem
  width 100%
  height 100%
  text-align left
  background white
  padding 20px 10.25px
  &__location
    padding-top 10px
    color #b3b3b3
    font-size 11px
    text-transform: uppercase
  &__price
    text-align left
    // bottom 3.5rem
    margin-bottom 15px
    // position absolute
    &.loading
      text-align center
      font-size 1.2em
  &__transparentButton
    background transparent
    padding 0
    border none
    font inherit
    color var(--color-red)
    &[disabled]
      cursor default
      i, p , span
        cursor default
  &__image
    position relative
    width 100%
    background-color white
    background-size contain
    background-repeat no-repeat
    background-position center
    overflow hidden
    padding-top 100%
  &__info
    padding 10px 5px 15px 5px
    margin-bottom auto
    h4
      margin-top 1rem
      font-weight 400
      font-size 16px
      margin-bottom 0
    h5
      font-weight 100
      margin 0
      color #555
    h6
      margin-top .5rem
      margin-bottom 0
      color #666
      font-weight 400
      font-size .75rem
    p
      font-size 13px
      color #888
  &__actions
    display flex
    align-items center
  &__tags
    display flex
    flex-wrap wrap
    margin 1rem 0 .25rem 0
  &__tag
    font-size 12px
    color var(--color-blue)
    cursor pointer
    margin-right 8px
  &__socialTop
    margin-bottom 1rem
    width 100%
    display flex
    align-items center
    justify-content center
    color #999
    user-select none
    span
      display flex
      align-items center
      justify-content space-between
    .commentCounter
      margin-right 1rem
  &__socialBottom
    width 100%
    // position absolute
    bottom 0
    left 0
    right 0
    // margin-bottom 1rem
    width 100%
    display flex
    align-items center
    justify-content center
    color var(--color-grey)
    font-size 1.5rem
    button
      p
        font-size 14px
      color var(--color-grey)
      cursor pointer
      display inline-flex
      align-items center
      &.addToCartButton
        &[disabled]
          cursor: default;
          & i
            color: #949494;
            background-color: #eee;
      &.addToCartButton i
        color #fff
        background-color var(--color-blue)
        border-radius 100%
      &:first-of-type
        margin-right 1.5rem
  &__actionCounter
    display flex !important
    align-items center
    margin-right 15px
    & i,& p,& span
      color #555
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
  &__commentCounter
    font-size: 14px
    margin-left 6px
    height: 100%
    display flex
    align-items center
.likeAnimation
  animation-name like
  animation-duration 0.5s
@keyframes like
  0%
    transform scale(1)
  25%
    transform scale(1.2)
  70%
    transform scale(0.9)
.out-of-stock-badge
  background-color #D44E5A
  padding 4px 11px
  align-self: flex-start;
  font-size: 11px;
  color: #fff;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
</style>
