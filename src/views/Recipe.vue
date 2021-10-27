<template>
  <div class="recipe">
    <h1 class="recipe__title">Plant-based Recipes</h1>
    <div class="recipe__items-container" v-if="loading">
      <LoadingProductCard v-for="index in 9" :key="`loadingRecipe_${index}`" />
    </div>

    <div class="recipe__items-container" v-else>
      <ProductCard
        style="min-height: unset"
        v-for="(recipe, index) in recipeItems"
        :key="`recipe_${index}`"
        :product="recipe"
      />
    </div>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import LoadingProductCard from '@/components/LoadingProductCard.vue'
import ProductCard from '@/components/ProductCard.vue'
import { getMetaTags } from '@/seo.js'

export default {
  components: {
    LoadingProductCard,
    ProductCard
  },
  data: () => ({
    loading: false,
    recipeItems: []
  }),
  mounted () {
    this.getRecipeItems()
  },
  methods: {
    async getRecipeItems () {
      try {
        this.loading = true
        // fetch all items
        const recipes = await httpClient.get('/items?collections=mightyplants_recipes&format=full')
        // filter based on item_type to get only recipe items
        this.recipeItems = recipes.data.filter(
          (item) => item.item_type === 'recipe'
        )
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    }
  },
  metaInfo () {
    const seo = {
      metaTitle: 'The UK’s Favourite Vegan Marketplace - Mighty Plants',
      metaDescription: 'Mighty - The plant-based recipes',
      shareImage: 'https://mightyplants.com/recipe.png'
    }
    return {
      title: 'Mighty Plants - Discover and Order the best new foods',
      meta: getMetaTags(seo)
    }
  }
}
</script>

<style lang="stylus" scoped>
.recipe {
  &__title {
    text-align: left;
    font-size: 21px;

    @media screen and (max-width: 500px) {
      font-size: 15px;
    }
  }

  &__items-container {
    display: grid;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    gap: 30px;
    grid-template: 1fr / 1fr 1fr 1fr 1fr;
    padding-bottom: 30px;

    @media screen and (max-width: 780px) {
      grid-template: unquote('1fr / minmax(0, 1fr) minmax(0, 1fr)');
      max-width: 460px;
    }

    @media screen and (max-width: 500px) {
      gap: 10px;
    }
  }
}
</style>
