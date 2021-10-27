<template>
  <div>
    <BigBanner :is-product="true" />
    <div class="productPage">
      <DetailedProductCard
        v-if="productData"
        :product-data="productData"
        @addProductToCart="$emit('addProductToCart', $event)" />
      <div
        v-if="productData"
        style="width: 100%; margin-top: 15px"
      >
        <div
          v-if="
            productData.item_type !== 'article' &&
              productData.item_type !== 'post'
          "
          class="productPage__tabs">
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'About' }"
            @click="openTab = 'About'">
            <span class="productPage__tab--label">About</span><i class="productPage__tab--icon fal fa-info-circle" />
          </button>
          <button
            class="productPage__tab"
            :class="{
              'productPage__tab--active': openTab === 'Nutrition Facts',
            }"
            @click="openTab = 'Nutrition Facts'">
            <span class="productPage__tab--label">Nutrition Facts</span><i class="productPage__tab--icon fal fa-clipboard-list" />
          </button>
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'Ingredients' }"
            @click="openTab = 'Ingredients'">
            <span class="productPage__tab--label">Ingredients</span><i class="productPage__tab--icon fal fa-carrot" />
          </button>
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'Reviews' }"
            @click="openTab = 'Reviews'">
            <span
              class="productPage__tab--label">Reviews ({{ reviews.length }})</span><i class="productPage__tab--icon fal fa-comments" />
          </button>
          <!-- <button
            class="productPage__tab"
            @click="openTab = 'FAQ'"
            :class="{ 'productPage__tab--active': openTab === 'FAQ' }"
          >
            FAQ
          </button> -->
        </div>
        <div
          v-if="
            productData.item_type !== 'article' &&
              productData.item_type !== 'post'
          "
          class="productPage__openTab">
          <template v-if="openTab === 'About'">
            <div v-if="productData.content">
              <vue-markdown
                :class="`${readMore ? 'content content--full' : 'content'}`">
                {{ productData.content }}
              </vue-markdown><span
                v-if="readMore !== true"
                class="readMore"
                @click="readMore = true">Read More</span>
            </div>
            <p
              v-else
              class="content">
              About
            </p>
          </template>
          <template v-else-if="openTab === 'Nutrition Facts'">
            <p class="content">
              Nutrition Facts
            </p>
          </template>
          <template v-else-if="openTab === 'Ingredients'">
            <IngredientsDisplay
              v-if="
                productData.ingredients && productData.ingredients.length > 0
              "
              :ingredients="productData.ingredients" />
            <p
              v-else
              class="content">
              Ingredients
            </p>
          </template>
          <template v-else-if="openTab === 'Reviews'">
            <div class="productPage__writeReview">
              <h2>Write a review</h2>
              <div
                v-if="$store.getters.isUserLoggedIn && editorMode"
                class="editorMode">
                <div class="editorMode--editor">
                  Rank this product from 1 to 10: &nbsp;
                  <RankInput v-model="newReview.rank" />
                  <textarea
                    v-model="newReview.content"
                    placeholder="Please enter your review here" />
                </div>
                <div>
                  <PhotoUploader
                    v-model="newReview['pictures']" />
                </div>
                <div>
                  <button
                    class="productPage__writeReview__add"
                    :disabled="newReview.content === ''"
                    @click="addReview()">
                    <span v-if="!loading">Submit</span><i
                      v-else
                      class="fal fa-spinner" />
                  </button>
                  <button
                    class="productPage__writeReview__cancel"
                    @click="cancelReview()">
                    Cancel
                  </button>
                </div>
              </div>
              <button
                v-else-if="!editorMode && $store.getters.isUserLoggedIn"
                class="productPage__writeReview--editorButton"
                @click="editorMode = true">
                <i class="fal fa-plus">&nbsp;</i><span>Add review</span>
              </button>
              <p v-else>
                Please
                <button
                  class="signIn"
                  @click.stop="$emit('openMagicSidebar')">
                  sign in
                </button>to continue.
              </p>
            </div>
            <h3 style="text-align: left">
              Reviews({{ reviews.length }}):
              <div
                v-for="(review, index) in reviews"
                :key="index"
                class="productPage__reviews">
                <div>
                  <div class="productPage__reviews--heading--title">
                    <img
                      class="productPage__reviews--heading--avatar"
                      :src="review.owner.image">
                    <h4>{{ review.owner.name }} &nbsp;</h4>
                  </div>
                  <p>Rating: {{ review.rank }}<i class="fas fa-star" /></p>
                  <p
                    :class="`${readMore ? 'content content--full' : 'content'}`">
                    {{ review.content }}
                  </p>
                  <span
                    v-if="readMore !== true"
                    class="readMore"
                    @click="readMore = true">Read More</span>
                </div>
                <img
                  v-if="review.pictures[0]"
                  class="productPage__reviews--heading--image"
                  :src="review.pictures[0]">
              </div>
            </h3>
          </template>
        </div>
      </div>
    </div>
    <RelatedProducts
      v-if="productData"
      :product="productData"
      :id="productData.id"
      :tags="productData.tags"
      @addProductToCart="$emit('addProductToCart', $event)" />
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

import BigBanner from '@/components/BigBanner.vue'
import DetailedProductCard from '@/components/DetailedProductCard.vue'
import VueMarkdown from 'vue-markdown'
import PhotoUploader from '@/components/PhotoUploader.vue'
import RankInput from '@/components/RankInput.vue'
import IngredientsDisplay from '@/components/IngredientsDisplay.vue'
import { reject } from 'q'
import RelatedProducts from '@/components/RelatedProducts.vue'
import { getMetaTags, getJsonLd } from '@/seo.js'
import format from 'date-fns/format'
import parseSegmentProduct from '@/segmentProduct'

export default {
  components: {
    BigBanner,
    RankInput,
    DetailedProductCard,
    VueMarkdown,
    IngredientsDisplay,
    PhotoUploader,
    RelatedProducts
  },
  data () {
    return {
      loading: false,
      editorMode: false,
      productLoaded: false,
      productData: null,
      openTab: 'About',
      reviews: [],
      newReview: {
        post_type: 'review',
        pictures: [],
        content: '',
        rank: 1
      },
      readMore: false
    }
  },
  computed: {
    slug () {
      return this.$route.params.slug
    }
  },
  created () {
    httpClient
      .get(`/item/${this.slug}`)
      .then((response) => {
        this.productData = response.data
        this.productLoaded = true
        this.getOfferings()
        this.getReviews()
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    formatDate (date) {
      return format(new Date(date), 'dd MMMM yyyy')
    },
    getOfferings () {
      httpClient
        .get(
          `/item/${this.productData.id}/links?page=1&per_page=100&link_format=full`
        )
        .then(async (response) => {
          if (!response.data.length) {
            this.productData.offerings = []
          }
          for (const link of response.data) {
            if (link.link_type === 'product-has-offerings') {
              await httpClient.get(`/item/${link.target}`).then((response2) => {
                if (!this.productData.offerings) this.productData.offerings = []
                this.productData.offerings.push(response2.data)
              })
            }
          }
          this.productData = { ...this.productData } // To make the state refresh
          if (this.productData.offerings.length) {
            window.analytics.track('Product Viewed', parseSegmentProduct(this.productData))
          }
        })
        .catch(() => {
          if (!this.productData.offerings) this.productData.offerings = []
          this.productData = { ...this.productData } // To make the state refresh
        })
    },
    getReviews () {
      httpClient
        .get(
          `/item/${this.productData.id}/posts?format=full&type=review&sort_by=desc(rank)`
        )
        .then((response) => {
          this.reviews = response.data
        })
    },
    cancelReview () {
      this.newReview = {}
      this.editorMode = false
    },
    addReview () {
      this.loading = true
      this.newReview.rank = parseInt(this.newReview.rank, 10)
      httpClient
        .post(`/item/${this.productData.id}/post`, this.newReview)
        .then((response) => {
          this.loading = false
          this.editorMode = false
          this.getReviews()
        })
        .catch((error) => {
          this.editorMode = false
          this.loading = false
          alert('Oops! Something went wrong, please try again.')
          reject(error)
        })
    }
  },
  metaInfo () {
    if (!this.productData) return
    const seo = {
      metaTitle: this.productData.name,
      metaDescription: this.productData.description,
      shareImage: this.productData.featured_picture,
      url: this.productData.slug
    }
    const jsonld = {
      name: this.productData.name,
      description: this.productData.description,
      type: 'Product',
      image: this.productData.pictures,
      sku: this.productData.offerings && this.productData.offerings[0] && this.productData.offerings[0].unique_identifier,
      brand: this.productData.owner && {
        '@type': 'Brand',
        'name': this.productData.owner.name
      },
      keywords: this.productData.tags,
      offers: this.productData.offerings && this.productData.offerings[0] ? {
        '@type': 'Offer',
        'url': `https://mightyplants.com/${this.productData.slug}`,
        'priceCurrency': this.productData.offerings && this.productData.offerings[0] && this.productData.offerings[0].currency,
        'price': this.productData.offerings && this.productData.offerings[0] && this.productData.offerings[0].price / 100,
        'sku': this.productData.offerings && this.productData.offerings[0] && this.productData.offerings[0].unique_identifier,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability':
          this.productData.offerings && this.productData.offerings[0] && this.productData.offerings[0].available_quantity > 0
            ? 'https://schema.org/InStock' : 'https://schema.org/InStock'
      } : null,
      review: this.reviews && this.reviews.length && this.reviews.map((review) => {
        return {
          '@type': 'Review',
          'author': review.owner.name,
          'datePublished': this.formatDate(review.created_at),
          'reviewBody': review.content,
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': review.rank,
            'bestRating': 10,
            'worstRating': 1
          }
        }
      }),
      aggregateRating: {
        '@type': 'AggregateRating',
        'ratingValue': 5,
        'ratingCount': this.productData.upvotes || 1
      }
    }
    return {
      title: this.productData.name
        ? `${this.productData.name} - Mighty Plants`
        : 'Mighty Plants - Discover and Order the best new foods',
      meta: getMetaTags(seo),
      script: [{
        type: 'application/ld+json',
        json: getJsonLd(jsonld)
      }]
    }
  }
}
</script>

<style lang="stylus" scoped>
h2
  font-weight normal
h3
  font-weight normal
h4
  font-weight normal
.signIn
  text-decoration underline
  background transparent
  border none
  cursor pointer
.productPage
  margin 0 auto
  background-color white
  border-radius 3rem
  padding 3rem
  min-height 30rem
  &__tabs
    width 100%
    border-top 1px solid #ddd
    display flex
    align-items center
    justify-content space-around
    padding 10px 0
    margin-bottom 15px
  &__tab
    width auto
    padding 0 10px
    height 40px
    display flex
    align-items center
    font inherit
    font-size 14px
    color black
    border none
    background-color white
    justify-content center
    cursor pointer
    &--icon
      display none
    &--active
      border-bottom 1px solid #222
      p
        color black
        height 100%
        display block
  &__openTab
    border-bottom 1px solid #ddd
    padding-bottom 20px
  &__writeReview
    font-size 14px
    text-align left
    border-bottom 1px solid #ddd
    padding-bottom 20px
    input
      position relative
      border none
      background #fff
      border 1px solid rgba(0, 0, 0, .1)
      padding 10px
      margin-bottom 20px
      font inherit
      transition border-color 0.3s
      &:focus
        border-color dodgerblue
    textarea
      width 100%
      min-height 100px
      position relative
      border none
      background #fff
      border 1px solid rgba(0, 0, 0, .1)
      padding 10px
      margin-bottom 10px
      font inherit
      transition border-color 0.3s
      &:focus
        border-color dodgerblue
    &--editorButton
      border none
      width auto
      border-radius 2px
      color white
      font inherit
      background-color black
      padding 5px 16px
      box-shadow 0 0 6px rgba(0, 0, 0, .13)
      cursor pointer
      margin 10px 0
      &[disabled]
        opacity .4
        cursor default
        &:hover
          opacity .4
    &__add
      border none
      width auto
      border-radius 2px
      color white
      font inherit
      background-color dodgerblue
      padding 5px 16px
      box-shadow 0 0 6px rgba(0, 0, 0, .13)
      cursor pointer
      margin 10px 0
      &[disabled]
        opacity .4
        cursor default
        &:hover
          opacity .4
    &__cancel
      border none
      width auto
      color black
      text-decoration underline
      font inherit
      background transparent
      padding 5px 16px
      cursor pointer
      margin 10px
      &[disabled]
        opacity .4
        cursor default
        &:hover
          opacity .4
  &__reviews
    display grid
    font-size 14px
    height auto
    max-width 100%
    grid-template auto / auto 300px
    text-align left
    border-bottom 1px solid #ddd
    margin-bottom 20px
    padding 20px 0
    i
      color #ffd700
      margin 11px 5px
    &--heading
      display flex
      &--title
        display flex
        flex-direction row
        h3
          width 100%
          margin 10px 0
        h4
          margin 10px 0
      &--image
        position relative
        vertical-align middle
        width auto
        max-height 150px
        float left
      &--avatar
        position relative
        vertical-align middle
        height 50px
        border-radius 50%
        width 50px
        margin-right 10px
.editorMode
  display flex
  font-size 14px
  flex-direction row
  flex-wrap wrap
  &--editor
    min-width 60%
  div
    margin 0 20px
    margin-left 0
.content
  font-size 14px
  text-align left
  font-size 14px
  max-height 200px
  width 100%
  overflow-y hidden
  &--full
    max-height 100%
.readMore
  font-size 14px
  float left
  color dodgerblue
  cursor pointer
.row
  font-size 14px
  display grid
  justify-content center
  align-items center
  margin 0 auto
  width 100%
  gap 30px
  grid-template 1fr / 1fr 1fr 1fr 1fr
  padding-bottom 30px
@media screen and (max-width: 955px)
  .row
    grid-template 1fr / 1fr 1fr 1fr
@media screen and (max-width: 780px)
  .row
    grid-template 1fr / 1fr 1fr
    max-width 460px
  .productPage
    &__reviews
      grid-template auto / auto
      &--heading
        &__image
          max-height 150px
          max-width 100%
        &--title
          flex-direction column
  .editorMode
    flex-direction column
    div
      margin 0
@media screen and (max-width: 550px)
  .row
    gap 10px
  .productPage
    padding 1.5rem
    border-radius 1.5rem
    &__tab
      &--label
        display none
      &--icon
        display block
    &__reviews
      &--heading
        flex-direction column-reverse
        &--image
          margin-right 0
          max-width 100%
        &--title
          flex-direction row
@media screen and (max-width: 450px)
  .row
    gap 0
@media screen and (max-width: 435px)
  .row
    grid-template 1fr / 1fr
    max-width 460px
  .productPage
    &__reviews
      grid-template auto / auto
      max-width 200px
      &--heading
        &__image
          max-height 150px
          max-width 200px
</style>
