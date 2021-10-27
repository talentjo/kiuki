<template>
  <div class="home">
    <BigBanner
      :collection="collection"
    />
    <h1 v-if="$route.params.tag">
      {{ $route.params.tag ? `#${$route.params.tag}` : '' }}
    </h1>
    <ais-configure
      :hits-per-page.camel="20"
      :query="$route.params.query"
      :filters="filters"
      :enable-personalization.camel="true"
      :user-token.camel="$cookies.get('user_id') || undefined"
    />
    <ais-infinite-hits>
      <template slot-scope="{ items, page, isLastPage, refineNext }">
        <div
          v-if="items.length"
          class="home__cardContainer">
          <ProductCard
            v-for="item in items" :key="item.objectID"
            :product="item"
            @addProductToCart="$emit('addProductToCart', $event)" />
        </div>
        <div
          v-else
          class="home__cardContainer-empty">
          <i class="fal fa-cat" />
          <p>No items found</p>
        </div>
        <div
          v-observe-visibility="(isVisible) => isVisible && !isLastPage ? refineNext() : null"
        />
      </template>
    </ais-infinite-hits>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import BigBanner from '@/components/BigBanner.vue'
import { getMetaTags } from '@/seo.js'
import { createWidgetMixin } from 'vue-instantsearch'
import { connectInfiniteHits } from 'instantsearch.js/es/connectors'
import httpClient from '@/services/httpClient'

export default {
  name: 'Home',
  components: {
    ProductCard,
    BigBanner
  },
  mixins: [createWidgetMixin({ connector: connectInfiniteHits })],
  data () {
    return {
      seo: {
        metaTitle: 'The UK’s Favourite Vegan Marketplace - Mighty Plants',
        metaDescription: 'We deliver plant-based foods straight to your door to help you save time and make your life easier.',
        shareImage: 'https://mightyplants.com/og_mP.png'
      },
      collection: null
    }
  },
  computed: {
    filters () {
      if (this.isCollection) {
        return `collections:${this.$store.state.collectionNames}`
      } else if (this.$route.name === 'tagPage') {
        return `tags:${this.$route.params.tag}`
      }

      return ''
    },
    isCollection () {
      return this.$route.name !== 'tagPage' && this.$store.state.collectionNames.length > 0
    }
  },
  created () {
    if (this.$route.name === 'home') {
      this.$store.commit('setCollectionNames', 'mightyplantshomepage')
    }
  },
  mounted () {
    const { tag } = this.$route.params
    if (tag) {
      this.seo = {
        ...this.seo,
        metaTitle: tag
      }
    }

    this.$nextTick(() => {
      if (this.isCollection) {
        this.getCollection(this.$store.state.collectionNames)
      }
    })

    window.analytics.identify(this.$store.state.userData.id, {
      name: this.$store.state.userData.name,
      email: this.$store.state.userData.email
    }, {
      integrations: {
        'All': true,
        'Algolia': false
      }
    })
  },
  methods: {
    getCollection (name) {
      httpClient
        .get(`/item-collection/${name}`)
        .then((response) => {
          this.collection = {
            ...response.data
          }
          this.seo = {
            ...this.seo,
            metaDescription: this.collection.description ? this.collection.description.replace(/\r?\n|\r/, '') : null,
            shareImage: this.collection.pictures ? this.collection.pictures[0] : null,
            metaTitle: this.collection.title
          }
        })
    }
  },
  metaInfo () {
    return {
      title: `${this.seo.metaTitle || 'The UK’s Favourite Vegan Marketplace'} - Mighty Plants`,
      meta: getMetaTags(this.seo)
    }
  }
}
</script>

<style lang="stylus" scoped>
.home
  margin 0 auto
  h1
    text-align left
    font-size 25px
  &__cardContainer
    display grid
    justify-content center
    align-items center
    margin 0 auto
    gap 30px
    grid-template 1fr / 1fr 1fr 1fr 1fr
    padding-bottom 30px
  &__cardContainer-empty
    margin 20px 0 30px 0
    i
      font-size 50px
@media screen and (max-width: 780px)
  .home__cardContainer
    grid-template: unquote("1fr / minmax(0, 1fr) minmax(0, 1fr)")
    max-width 460px
@media screen and (max-width: 500px)
  .home__cardContainer
    gap 10px
</style>
