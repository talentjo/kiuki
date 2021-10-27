<template>
  <div class="magazine">
    <h1 class="magazine__title">The plant-based lifestyle magazine</h1>
    <div class="magazine__items-container" v-if="loading">
      <LoadingProductCard
        v-for="index in 9"
        :key="`loadingMagazine_${index}`"
      />
    </div>

    <div class="magazine__items-container" v-else>
      <ProductCard
        style="min-height: unset"
        v-for="(magazine, index) in magazineItems"
        :key="`magazine_${index}`"
        :product="magazine"
        magazine
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
    magazineItems: []
  }),
  mounted () {
    this.getMagazineItems()
  },
  methods: {
    async getMagazineItems () {
      try {
        this.loading = true
        // fetch all items
        const magazines = await httpClient.get('/items?collections=mightyplants_magazine&format=full')
        // filter based on item_type to get only magazine items
        this.magazineItems = magazines.data.filter(
          (item) => item.item_type === 'article'
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
      metaDescription: 'Mighty - The plant-based lifestyle magazine',
      shareImage: 'https://mightyplants.com/magazine.png'
    }
    return {
      title: 'Mighty Plants - Discover and Order the best new foods',
      meta: getMetaTags(seo)
    }
  }
}
</script>

<style lang="stylus" scoped>
.magazine {
  &__title {
    text-transform: uppercase;
    letter-spacing: 5px
    text-align: left;
    font-size: 21px;

    @media screen and (max-width: 500px) {
      font-size: 15px;
      letter-spacing: 1px
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
