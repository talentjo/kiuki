<template>
  <div>
    <div class="orgContainer">
      <div class="wrapper__box">
        <div class="wrapper__orgBar">
          <img
            class="wrapper__orgBar__boxImage"
            :src="orgData.logo"
            style="width: 100%"
            alt="logo">
        </div>
      </div>
      <div class="wrapper__box__container">
        <div class="wrapper__box__content">
          <h1>{{ orgData.name }}</h1>
          <!-- <div v-if="orgData.year_founded">
            Founded in {{ orgData.year_founded }}
          </div>
          <div v-else>
            Founded in {{ year }}
          </div> -->
          <div
            v-if="orgData.description"
            class="wrapper__box__boxInner">
            <div class="wrapper__box__boxInnerContent">
              {{ orgData.description }}
            </div>
          </div>
          <div class="tags_row">
            <router-link
              v-for="(item, index) in orgData.industry"
              :key="index"
              class="tags"
              :to="`/tag/${item}`">
              {{ '#' + item }}
            </router-link>
          </div>
          <div
            v-if="orgData.address"
            class="wrapper__box__boxInner">
            <!-- <div class="wrapper__box__boxInnerContent">
              {{ orgData.address.street_address }}, {{ orgData.address.city }},
              {{ orgData.address.country }}, {{ orgData.address.postcode }}
            </div> -->
            <div
              v-if="orgData.urls"
              class="wrapper__box__boxInnerContent">
              <a
                v-if="orgData.urls.website"
                :href="orgData.urls.website"><i class="urls fal fa-link" /></a><a
                  v-if="orgData.urls.facebook"
                  :href="orgData.urls.facebook"><i class="urls fab fa-facebook-f" /></a><a
                    v-if="orgData.urls.instagram"
                    :href="orgData.urls.website"><i class="urls fab fa-instagram" /></a><a
                      v-if="orgData.urls.linkedin"
                      :href="orgData.urls.website"><i class="urls fab fa-linkedin-in" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wrapper">
      <div class="box" />

      <!-- Tabs -->
      <div class="tabs">
        <!-- Tab items -->
        <ul class="tabs__list">
          <li
            class="tabs__item"
            :class="{ 'tabs__item--active': tab.id === activeTab }"
            v-for="tab in tabItems"
            :key="tab.id"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </li>
        </ul>

        <!-- Tab content -->
        <ul class="tabs__content-list">
          <li class="tabs__content" v-if="activeTab === 'products'">
            <div class="row">
              <ProductCard
                v-for="(product, index) in orgProducts"
                :key="`product_${index}`"
                :product="product" />
            </div>
          </li>
          <li class="tabs__content" v-if="activeTab === 'recipes'">
            <div class="row">
              <ProductCard
                v-for="(product, index) in orgRecipes"
                :key="`recipe_${index}`"
                :product="product" />
            </div>
          </li>
          <li class="tabs__content" v-if="activeTab === 'news'">
            <div class="row">
              <ProductCard
                v-for="(product, index) in orgArticles"
                :key="`article_${index}`"
                :product="product"
                magazine />
            </div>
          </li>
          <li class="tabs__content" v-if="activeTab === 'posts'">
            <div class="row">
              <ProductCard
                v-for="(product, index) in orgPosts"
                :key="`post_${index}`"
                :product="product" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import httpClient from '@/services/httpClient'
import { getMetaTags, getJsonLd } from '@/seo.js'

export default {
  components: {
    ProductCard
  },
  data () {
    return {
      orgData: {},
      orgProducts: [],
      orgRecipes: [],
      orgArticles: [],
      orgPosts: [],
      activeTab: 'products',
      tabItems: []
    }
  },
  computed: {
    year () {
      return this.orgData.created_at.slice(0, 4)
    }
  },
  created () {
    this.getOrgData()
    this.getOrgProducts()
  },
  methods: {
    getOrgData () {
      const { slug } = this.$route.params
      httpClient.get(`/org/${slug}`).then((response) => {
        this.orgData = response.data
      })
    },
    getOrgProducts () {
      const { slug } = this.$route.params
      httpClient.get(`/org/${slug}/items?format=full`).then((response) => {
        for (const el of response.data) {
          switch (el.item_type) {
            case 'packagedfood':
              this.orgProducts.push(el)
              break
            case 'article':
              this.orgArticles.push(el)
              break
            case 'recipe':
              this.orgRecipes.push(el)
              break
            case 'post':
              this.orgPosts.push(el)
              break
            default:
              break
          }
        }

        let items = []

        this.orgProducts.length !== 0 && items.push({ id: 'products', label: 'Products' })
        this.orgRecipes.length !== 0 && items.push({ id: 'recipes', label: 'Recipes' })
        this.orgArticles.length !== 0 && items.push({ id: 'news', label: 'News' })
        this.orgPosts.length !== 0 && items.push({ id: 'posts', label: 'Posts' })

        this.tabItems = items
      })
    },
    getTags () {}
  },
  metaInfo () {
    const seo = {
      metaTitle: this.orgData.name,
      metaDescription: this.orgData.description,
      shareImage: this.orgData.logo,
      url: this.orgData.slug
    }
    const jsonld = {
      name: this.orgData.name,
      type: 'Organization',
      description: this.orgData.description,
      image: this.orgData.logo,
      email: this.orgData.contact_email,
      telephone: this.orgData.contact_phone,
      address: {
        '@type': 'PostalAddress',
        'streetAddress': this.orgData.address && this.orgData.address.street_address,
        'addressLocality': this.orgData.address && this.orgData.address.city
      }
    }
    return {
      title: this.orgData.name
        ? `${this.orgData.name} - Mighty Plants`
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

<style lang="stylus">
.orgContainer {
  display: flex;
  background: white;
  border: 3px solid white;
  border-radius: 30px;

  @media screen and (max-width: 560px) {
    display grid
  }
}
.wrapper__box__container {
  width: 70%

  @media screen and (max-width: 560px) {
    width: 100%
  }
}
.tabs {
  width: 100%
  display block
  grid-column 1 / -1
  padding: 5px;
  text-align: left;

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    background-color #fafafa
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  &__item {
    padding: 10px
    text-transform: capitalize
    cursor: pointer;
    border-bottom: 1px solid transparent;
    font-size: 15px;

    @media screen and (max-width: 400px) {
      font-size: 13px;
      padding: 5px;
    }

    &--active {
      border-bottom-color: #000;
    }
  }

  &__content-list {
    margin: 0;
    padding: 0;
    list-style: none;
    margin-top: 20px
    padding: 5px

    @media screen and (max-width: 400px) {
      margin-top: 10px
    }
  }
}

.wrapper
  color #000
  display grid
  grid-gap 1em
  grid-template-areas "orgBar" "content" "productCards"
  &__box
    width 30%
    padding 10px
    font-size 150%

    @media screen and (max-width: 560px) {
      width 100%
    }
    &__content
      padding-left 30px
      display flex
      align-items flex-start
      flex-direction column
      grid-area content
    &__boxInner
      display flex
      align-items flex-start
      flex-direction column
      font-size 1rem
    &__boxInnerContent
      font-size 0.9rem
      text-align left
      margin-top 10px
  &__orgBar
  width 30%
    grid-area orgBar
    &__boxImage
      object-fit contain
      width 100%
      height 100%
  &__productCards
    display flex
    flex-flow row wrap
    grid-area productCards
    background #fff
    justify-content flex-start
    border-bottom 1px solid #ddd
    margin-top 10px
    padding-bottom 1rem
  h1
    font-size 22px
    font-weight 400
    margin-bottom 3px
  h2
    font-size 15px
    font-weight 400
    margin-top 0
    color #666

.urls
  margin 10px

.row
  display grid
  justify-content center
  align-items center
  margin 0 auto
  gap 30px
  width 100%
  grid-template 1fr / 1fr 1fr 1fr 1fr
  padding-bottom 10px

.tags
  font-size 12px
  color #00b1ab
  cursor pointer
  margin-right 8px
  &_row
    margin 13px 0
    width 100%
    justify-content flex-start
    display flex
    flex-flow row wrap

@media only screen and (min-width: 500px)
  .wrapper
    grid-template-columns 40% auto
    grid-template-areas "orgBar  content" "productCards   productCards"

@media only screen and (min-width: 600px)
  .wrapper
    grid-gap 20px
    grid-template-columns 320px auto
    grid-template-areas "orgBar content" "productCards  productCards  productCards"
    max-width 100%
@media screen and (max-width: 955px)
  .row
    grid-template 1fr / 1fr 1fr 1fr
@media screen and (max-width: 780px)
  .row
    grid-template 1fr / 1fr 1fr
    max-width 460px
@media screen and (max-width: 500px)
  .row
    gap 10px
@media screen and (max-width: 450px)
  .row
    gap 0
    row-gap 1rem
@media screen and (max-width: 435px)
  .row
    grid-template 1fr / 1fr
    max-width 460px
</style>
