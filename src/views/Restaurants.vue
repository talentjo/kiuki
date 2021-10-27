<template>
  <div class="restaurant">

    <div class="restaurant__top">
      <h1>Vegan Restaurants in the UK</h1>
      <span class="more">
        Find the best plant-based food near you!
      </span>
    </div>
    <div class="restaurant__container" v-if="loading">
      <LoadingProductCard v-for="index in 9" :key="`loadingRecipe_${index}`" />
    </div>

    <div class="restaurant__container" v-else>
      <div class="restaurant__no-item" v-if="restaurants.length === 0">
        No restaurant found in UK!
      </div>

      <template v-else>
        <ProductCard
          style="min-height: unset"
          v-for="(restaurant, index) in restaurants"
          :key="`recipe_${index}`"
          :product="restaurant"
          restaurant
        />
      </template>
    </div>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

import LoadingProductCard from '@/components/LoadingProductCard.vue'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'Restaurants',

  components: {
    LoadingProductCard,
    ProductCard
  },

  data: () => ({
    loading: false,
    restaurants: []
  }),

  async mounted () {
    await this.getRestaurants()
  },

  methods: {
    async getRestaurants () {
      try {
        this.loading = true
        // geo is limited to UK
        const res = await httpClient.get(
          '/items?collections=mightyplants_restaurants&format=full'
        )
        this.restaurants = res.data
        this.loading = false
      } catch (e) {
        this.loading = false
        console.log(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.restaurant {
  &__top {
    text-align: left;
    margin-bottom: 4rem;
    padding: 1rem 0.625rem 0 0.625rem;

    h1 {
      font-family: 'Patua One', cursive;
      font-weight: 400;
      font-size: 2rem;
      letter-spacing: .025em;
      margin: 1rem 0;

      @media screen and (min-width: 700px) {
        font-size: 2.75rem;
      }
    }

    .more {
      display: block;
      margin-top: 2rem;
      a {
        text-decoration: underline;
      }
    }
  }

  &__container {
    display: grid;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    grid-gap: 30px;
    grid-template: 1fr / 1fr 1fr 1fr 1fr;
    padding-bottom: 30px;

    @media screen and (max-width: 780px) {
      grid-template: unquote('1fr / minmax(0, 1fr) minmax(0, 1fr)');
      max-width: 460px;
    }

    @media screen and (max-width: 500px) {
      grid-gap: 10px;
    }
  }

  &__no-item {
    font-size: 20px;
    padding: 10px;
    margin: 50px 0;
    grid-column: 1 / -1;
  }
}
</style>
