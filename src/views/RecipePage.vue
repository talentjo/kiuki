<template>
  <div>
    <div class="recipe">
      <div class="recipe__figure">
        <img
          :src="productData.featured_picture"
          alt="food's photo">
      </div>
      <div class="recipe__info">
        <h1 class="recipe__title">
          {{ productData.name }}
        </h1>
        <hr>
        <p class="recipe__desc">
          “{{ productData.description }}”
        </p>
        <hr>
        <div class="recipe__detail">
          <span class="recipe__detail-key">Serves</span>
          <span class="recipe__detail-value">{{ productData.servings }}</span>
        </div>
        <div class="recipe__detail">
          <span class="recipe__detail-key">Cooks in</span>
          <span
            class="recipe__detail-value">{{ productData.preparation_time }} min</span>
        </div>
        <div class="recipe__detail">
          <span class="recipe__detail-key">Difficulty level</span>
          <span class="recipe__detail-value">{{
            productData.difficulty_level
          }}</span>
        </div>
        <hr>
        <div class="recipe__tags">
          <img
            class="recipe__tag-icon"
            draggable="false"
            :src="TagIcon"
            alt="icon">

          <router-link
            v-for="tag in productData.tags"
            v-bind:key="`/tag/${tag}/`"
            class="recipe__tag"
            :to="`/tag/${tag}/`">
            {{ tag }}
          </router-link>
        </div>
        <hr>
        <div class="recipe__nutritions">
          <div class="recipe__nutrition-list">
            <!-- Nutrition item -->
            <div class="recipe__nutrition">
              <div class="recipe__nutrition-info">
                <span class="recipe__nutrition-info-title">Calories</span>
                <p class="recipe__nutrition-info-desc">
                  Calories are just a unit of energy. If you eat more than you
                  use you can gain weight, or lose it if you don't eat enough.
                  How much you need depends on your weight, gender and how
                  active you are, but it's around 2,000 a day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recipe-info">
      <div class="ingredients">
        <span class="ingredients__title">Ingredients</span>
        <ul class="ingredients__list">
          <li
            v-for="ingredient in productData.ingredients"
            :key="ingredient.name"
            class="ingredients__item">
            <b>{{ ingredient.name }}</b> {{ ingredient.quantity }} {{ ingredient.unit }}
          </li>
        </ul>
      </div>

      <div class="method">
        <span class="method__title">Method</span>
        <p
          class="method__item"
          v-html="productData.content" />
      </div>
    </div>

    <h2 class="related-products">
      Related Products
    </h2>
    <RelatedProducts
      :products="relatedProductItems"
      @addProductToCart="$emit('addProductToCart', $event)" />
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

import RelatedProducts from '@/components/RelatedProducts.vue'
import { getMetaTags, getJsonLd } from '@/seo.js'

import TagIcon from '@/assets/price-tag.svg'

export default {
  name: 'RecipePage',
  components: {
    RelatedProducts
  },
  data: () => ({
    TagIcon,
    relatedProductItems: [],
    productData: {}
  }),
  computed: {
    slug () {
      return this.$route.params.slug
    }
  },
  mounted () {
    httpClient.get(`/item/${this.slug}`).then((response) => {
      this.productData = response.data
      this.productLoaded = true
      this.getRelatedProducts()
    })
  },
  methods: {
    getRelatedProducts () {
      httpClient
        .get(`/org/${this.productData.owner.id}/items?format=full`)
        .then((res) => {
          this.relatedProductItems = res.data
        })
    }
  },
  metaInfo () {
    const seo = {
      metaTitle: this.productData.name,
      metaDescription: this.productData.description,
      shareImage: this.productData.featured_picture,
      url: 'recipe/' + this.productData.slug
    }
    const jsonld = {
      name: this.productData.name,
      type: 'Recipe',
      description: this.productData.description,
      image: this.productData.pictures,
      recipeIngredient: this.productData.ingredients && this.productData.ingredients.map((ingre) => {
        return `${ingre.quantity} ${ingre.name}`
      }),
      recipeInstructions: this.productData.content && this.productData.content
        .split('\n')
        .filter(val => val)
        .map((instruct) => ({
          '@type': 'HowToStep',
          'text': instruct
        })),
      prepTime: `PT${this.productData.preparation_time}M`,
      cookTime: `PT${this.productData.preparation_time}M`,
      author: this.productData.owner && {
        '@type': 'Person',
        'name': this.productData.owner.name
      },
      keywords: this.productData.tags,
      aggregateRating: {
        '@type': 'AggregateRating',
        'ratingValue': 5,
        'ratingCount': this.productData.upvotes || 1
      }
    }
    return {
      title: `${this.productData.name} - Mighty Plants`,
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
.recipe {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 30px;
  text-align: left;
  margin-top: 50px;

  @media only screen and (max-width: 750px) {
    grid-template-columns: 1fr;
    grid-gap: 20px;
  }

  &__figure {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @media only screen and (max-width: 750px) {
      align-items: center;
    }

    & img {
      margin-bottom: 15px;
      width: 400px;

      @media only screen and (max-width: 400px) {
        width: 100%;
      }
    }
  }

  &__btn {
    font-size: 12px;
    padding: 8px 10px;
    cursor: pointer;
    font-family: inherit;
    font-weight: bold;
    background-color: #62a5a1;
    border: none;
    color: #fff;
    border-radius: 3px;
    line-height: 1;
  }

  &__title {
    margin: 0 0 10px 0;
  }

  &__subtitle {
    color: #a3865b;
    text-transform: uppercase;
    margin: 0 0 15px 0;
  }

  &__category {
    background-color: #62a5a1;
    color: #fff;
    font-size: 13px;
    padding: 10px 15px;
    display: inline-block;
    line-height: 1;
    text-transform: uppercase;
  }

  & hr {
    margin: 15px 0;
    border: none;
    border-top: 1px solid #878787;
  }

  &__detail {
    display: flex;
    align-items: center;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: bold;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  &__detail-key {
    margin-right: 5px;
    color: #a3865b;
  }

  &__tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  &__tag-icon {
    height: 23px;
    margin-right: 10px;
  }

  &__tag {
    color: #62a5a1;
    margin: 5px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      color: #000;
    }

    &::after {
      content: ',';
    }

    &:last-of-type {
      &::after {
        display: none;
      }
    }
  }

  &__nutritions {
    display: flex;
    flex-direction: column;
  }

  &__nutritions-text {
    font-size: 11px;
    text-transform: uppercase;
    margin: 0;
    font-weight: bold;
  }

  &__nutrition-list {
    display: flex;
    margin: 10px 0;
  }

  &__nutrition {
    position: relative;
  }

  &__nutrition-item {
    padding: 6px;
    border: 1px solid #000;
    border-radius: 3px;
    max-width: max-content;
    min-width: 65px;
    display: flex;
    flex-direction: column;
    text-align: center;
    cursor: pointer;

    &:hover + .recipe__nutrition-info {
      display: block;
    }

    & hr {
      margin: 5px 0;
      border: none;
      border-top: 1px solid #c2c2c2;
    }
  }

  &__nutrition-item-label {
    font-size: 12px;
    text-transform: capitalize;
    margin-bottom: 10px;
  }

  &__nutrition-item-value {
    font-size: 14px;
  }

  &__nutrition-info {
    position: absolute;
    border: 1px solid #a3865b;
    border-radius: 3px;
    padding: 15px 25px 20px 25px;
    margin-top: 10px;
    text-align: center;
    background-color: #fff;
    width: 300px;
    z-index: 100;
    left: 50%;
    transform: translateX(-50%);
    display: none;

    @media only screen and (max-width: 750px) {
      transform: none;
      left: 0;
    }
  }

  &__nutrition-info-title {
    margin: 0 15px 10px 0;
    font-size: 30px;
    border-bottom: 3px solid #c5b9a0;
    padding-bottom: 3px;
    display: inline-block;
  }

  &__nutrition-info-desc {
    margin: 0;
    line-height: 1.6;
  }
}

.recipe-info {
  @extend .recipe;
  margin-top: 20px;
}

.ingredients {
  min-width: 250px;

  &__title {
    font-size: 24px;
    font-style: italic;
    margin-bottom: 10px;
    display: block;
  }

  &__list {
    list-style: none;
    padding: 0;

    & > * + * {
      margin-top: 10px;
    }
  }

  &__item {
    font-size: 17px;
  }
}

.method {
  &__title {
    @extend .ingredients__title;
  }

  &__item {
    font-size: 16px;
    white-space: pre-wrap;
    line-height: 1.7;
  }
}

.related-products {
  margin-top: 50px;
}
</style>
