<template>
  <div class="itemArticle">
    <div
      v-if="itemData.id"
      class="itemArticle__content"
    >
      <div class="itemArticle__container">
        <h1 class="itemArticle__title">{{itemData.name}}</h1>
        <div class="itemArticle__author">
          <div class="itemArticle__profilePicture" :style="{ backgroundImage: `url(${itemData.owner.image})` }"></div>
          <span>by {{ itemData.owner.name }}</span>
        </div>
        <div class="itemArticle__tags">
          <router-link
            class="itemArticle__tag"
            v-for="tag in itemData.tags"
            :to="`/tag/${tag}/`"
            :key="tag">
            #{{tag}}
          </router-link>
        </div>
        <div class="itemArticle__text">
          <vue-markdown :key="itemData.id">{{itemData.description}}</vue-markdown>
        </div>
      </div>
      <div class="tiny-slider-container">
        <tiny-slider
          class="itemArticle__slider"
          v-bind="sliderOptions"
          ref="tinySlider"
        >
          <img :key="picture" v-for="picture in itemData.pictures" class="itemArticle__slider-img" :src="picture + '?width=1200&height=700&fill=true&quality=80'"/>
        </tiny-slider>
        <div v-if="itemData.pictures.length > 1" class="tiny-slider-custom-controls">
          <button class="tiny-slider-custom-control" @click="goToSlide('prev')">
            <i class="fas fa-angle-left fa-4x"></i>
          </button>
          <button class="tiny-slider-custom-control" @click="goToSlide('next')">
            <i class="fas fa-angle-right fa-4x"></i>
          </button>
        </div>
      </div>
      <div class="itemArticle__container">
        <div v-if="itemData.ingredients && itemData.ingredients.length > 0" style="font-size: 14px">
          <span>Ingredients: </span>
          <span v-for="(ingredient, index) in itemData.ingredients" :key="index">
            {{ingredient.name}} ({{ingredient.quantity ? ingredient.quantity : null}} {{ingredient.unit ? ingredient.unit : null}}),
          </span>
        </div>
        <div v-if="itemData.servings">
          Servings: {{itemData.servings}}
        </div>
        <div v-if="itemData.preparation_time">
          Preparation time: {{itemData.preparation_time}} mins
        </div>
        <div v-if="itemData.difficulty_level">
          Difficulty level: {{ difficultyLevel }}
        </div>
        <div class="itemArticle__text">
          <vue-markdown :key="itemData.id">{{itemData.content}}</vue-markdown>
        </div>
      </div>
    </div>
    <h2 v-if="linkedItemsFound" class="related-items">
      Related Items
    </h2>
    <RelatedProducts
      v-if="itemData.id"
      :id="itemData.id"
      source="api"
      @addProductToCart="$emit('addProductToCart', $event)"
      @linkedItemsFound="linkedItemsFound = true" />
  </div>
</template>

<script>
import axios from 'axios'
import VueMarkdown from 'vue-markdown'
import RelatedProducts from '@/components/RelatedProducts.vue'
import { API_URL } from '@/config.js'
import VueTinySlider from 'vue-tiny-slider'
import 'tiny-slider/dist/tiny-slider.css'
import { getMetaTags } from '@/seo.js'

export default {
  name: 'ItemArticle',
  created () {
    this.slug = this.$route.params.slug
    this.getItemData(function (item) {
      this.itemData = item
    }.bind(this))
  },
  components: {
    RelatedProducts,
    VueMarkdown,
    'tiny-slider': VueTinySlider
  },
  data: function () {
    return {
      links: [],
      linkedItemsFound: false,
      sliderOptions: {
        mouseDrag: true,
        loop: true,
        items: 1,
        controls: false,
        nav: false,
        preventScrollOnTouch: 'auto'
      },
      title: '',
      slug: '',
      itemData: {
        title: '',
        description: '',
        lang: '',
        tags: ['vegan', 'article'],
        featured_picture: '',
        pictures: [],
        slug: '',
        visible: false,
        approved: false
      }
    }
  },
  computed: {
    difficultyLevel () {
      if (this.itemData.difficulty_level === 1) {
        return 'Easy'
      } else if (this.itemData.difficulty_level === 2) {
        return 'Medium'
      } else {
        return 'Hard'
      }
    }
  },
  metaInfo () {
    const seo = {
      metaTitle: this.itemData.name,
      metaDescription: this.itemData.description,
      shareImage: this.itemData.featured_picture,
      url: 'mag/' + this.itemData.slug
    }
    return {
      title: `${this.itemData.name} - Mighty Plants`,
      meta: getMetaTags(seo)
    }
  },
  methods: {
    goToSlide (status) {
      const info = this.$refs.tinySlider.slider.getInfo()
      const currentIndex = info.displayIndex - 1
      const allItemsLength = this.itemData.pictures.length

      if (status === 'next') {
        if (currentIndex + 1 !== allItemsLength) {
          this.$refs.tinySlider.slider.goTo(currentIndex + 1)
        } else {
          this.$refs.tinySlider.slider.goTo(0)
        }
      } else if (status === 'prev') {
        if (currentIndex - 1 >= 0) {
          this.$refs.tinySlider.slider.goTo(currentIndex - 1)
        } else {
          this.$refs.tinySlider.slider.goTo(allItemsLength - 1)
        }
      }
    },
    setTab (name) {
      this.activeTab = name
    },
    getItemData (callback) {
      axios.get(API_URL + '/item/' + this.slug)
        .then(function (response) {
          callback(response.data)
        })
        .catch(error => {
          console.error(error)
          this.$router.replace({ name: '404' })
        })
    },
    cloneObject (obj) {
      var clone = {}
      for (var i in obj) {
        if (obj[i] != null && typeof (obj[i]) === 'object') {
          clone[i] = this.cloneObject(obj[i])
        } else {
          clone[i] = obj[i]
        }
      }
      return clone
    }
  }
}
</script>

<style scoped lang="stylus">
.itemArticle
  width 100%
  box-sizing border-box
  padding 30px 30px 35px 30px
  text-align left
  z-index 1
  &__content
    margin 20px auto 60px auto
    border-radius 5px
    background white
    max-width 800px
    padding 42px 0
    width 80%
    background #fafafa
  &__author
    display flex
    align-items center
    padding 8px 0 15px 0
    font-size 13px
  &__text
    font-size 18px
    line-height 31px
    color #000
    /deep/ a
      text-decoration underline
  &__container
    padding 0 80px
    box-sizing border-box
    p
      font-family serif
      font-size 18px
      color #444
  &__title
    font-size 35px
    box-sizing border-box
    color #000
  &__author
    color #888
    font-size 12px
  &__shortDescription
    max-width 600px
  &__tags
    max-width 600px
  &__tag
    margin-right 8px
    display inline-block
    font-size 12px
    text-decoration none
    color: var(--color-blue);
  &__profilePicture
    display inline-block
    position relative
    width 30px
    height 30px
    margin-right 12px
    border-radius 60px
    background-color #fafafa
    background-repeat no-repeat
    background-size 100%
    background-position center
  &__slider
    margin 20px 0
  &__slider-img
    position static !important
    transform none !important
    max-width unset !important
@media screen and (max-width: 868px)
  .itemArticle
    padding 30px 5px
    &__content
      width 93%
    &__container
      padding 30px 20px

.related-items
  margin-top: 20px
  text-align: center !important
.tiny-slider-container
  position relative
.tiny-slider-custom-controls
  pointer-events none
  display flex
  justify-content space-between
  position absolute
  top 50%
  left 50%
  width 120%
  transform translate(-50%, -50%)
  @media only screen and (max-width: 870px)
    width 95%
  @media only screen and (max-width: 600px)
    width 95%
.tiny-slider-custom-control
  pointer-events all
  background none
  color var(--color-grey)
  border none
  padding 10px
  cursor pointer
  display flex
  align-items center
  justify-content center
  margin 0
  &:focus
    outline none
  @media only screen and (max-width: 870px)
    i
      font-size 30px
      opacity 0.8
  @media only screen and (max-width: 400px)
    padding 7px
</style>
