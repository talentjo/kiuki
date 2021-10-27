<template>
  <div class="relatedProducts">
    <template v-if="source === 'algolia'">
      <ais-index :index-name="ALGOLIA_INDEX">
        <ais-experimental-configure-related-items
          :hit="{ id, tags }"
          :matchingPatterns="matchingPatterns"
        />
        <ais-configure
          :hits-per-page.camel="8"
          :filters="`NOT id:${id}`"
          :enable-personalization.camel="true"
          :user-token.camel="$cookies.get('user_id') || undefined"
        />
        <ais-hits class="cardHolder">
          <template slot-scope="{ items }">
            <ProductCard
              v-for="(product, index) in items"
              :key="`product_${index}`"
              :product="product"
              @addProductToCart="$emit('addProductToCart', $event)" />
          </template>
        </ais-hits>
      </ais-index>
    </template>
    <template v-else-if="source === 'api'">
      <div class="cardHolder">
        <ProductCard
          v-for="(product, index) in linkedItems"
          :key="`product_${index}`"
          :product="product"
          @addProductToCart="$emit('addProductToCart', $event)" />
      </div>
    </template>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import { ALGOLIA_INDEX } from '@/config.js'
import httpClient from '@/services/httpClient'

export default {
  name: 'RelatedProducts',
  components: {
    ProductCard
  },
  props: {
    source: {
      type: String, // "api" || "algolia"
      default: 'algolia'
    },
    id: String,
    tags: Array
  },
  data: () => ({
    matchingPatterns: {
      tags: { score: 1 }
    },
    ALGOLIA_INDEX,
    linkedItems: []
  }),
  created () {
    if (this.source === 'api') {
      httpClient
        .get(`/item/${this.id}/links?page=1&per_page=100`)
        .then((response) => {
          for (const link of response.data) {
            httpClient.get(`/item/${link.target}`).then((response2) => {
              this.linkedItems.push(response2.data)
              this.$emit('linkedItemsFound')
            })
          }
        })
    }
  }
}
</script>

<style scoped lang="stylus">
.relatedProducts {
  padding-top: 30px;
  margin: 20px 50px 15px 50px;
}

.cardHolder {
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 237px));
  align-items: center;
  justify-content: center;
}
</style>
