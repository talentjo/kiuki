<template>
  <div class="product">
    <router-link :to="`/${data.slug}`">
      <div class="product__inner">
        <img
          :src="data.featured_picture"
          width="80">
        <p>{{ data.name }}</p>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: ['data']
}
</script>

<style lang="stylus">
.product
  max-width 20em !important
  height 170px
  padding 8px 8px 0 8px
  border-radius 5.4px
  margin 0.8em
  overflow hidden
  position relative
  flex auto
  transition 380ms
  cursor pointer
  img
    max-width 100%
    height auto !important
    text-align center
  &__inner
    display flex
    align-items center
    flex-flow column wrap
    p
      font-size 0.9rem
      color #000
      margin 8px 0 0 0
</style>
