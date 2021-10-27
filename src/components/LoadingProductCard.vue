<template>
  <div class="loadingProductCard">
    <vue-content-loading
      :width="220"
      :height="385"
      view-box="0 0 220 385">
      <rect
        x="0"
        y="3"
        rx="30"
        ry="30"
        width="220"
        height="150" />
      <rect
        x="0"
        y="170"
        rx="12"
        ry="12"
        width="140"
        height="22" />
      <rect
        x="0"
        y="197"
        rx="8"
        ry="8"
        width="110"
        height="16" />
      <rect
        x="0"
        y="227"
        rx="8"
        ry="8"
        width="200"
        height="80" />
      <rect
        x="0"
        y="326"
        rx="2"
        ry="2"
        width="43"
        height="9" />
      <rect
        x="53"
        y="326"
        rx="2"
        ry="2"
        width="45"
        height="9" />
      <rect
        x="109"
        y="326"
        rx="2"
        ry="2"
        width="34"
        height="9" />
      <rect
        x="153"
        y="326"
        rx="2"
        ry="2"
        width="18"
        height="9" />
      <rect
        x="0"
        y="341"
        rx="2"
        ry="2"
        width="53"
        height="9" />
    </vue-content-loading>
    <div class="loadingProductCard__socialBottom">
      <span><i class="fal fa-plus-circle" />
        <i class="fal fa-heart-circle" />
        <i class="fal fa-comments" /></span>
    </div>
  </div>
</template>

<script>
import VueContentLoading from 'vue-content-loading'

// @vuese
// This component is displayed when data from API has not been received yet.
// It greatly improves the UX
export default {
  name: 'LoadingProductCard',
  components: {
    VueContentLoading
  }
}
</script>

<style scoped lang="stylus">
.loadingProductCard
  display inline-block
  position relative
  margin 0 auto
  width 216px
  text-align left
  border-radius 30px
  background white
  padding 20px 10px
  &__socialBottom
    width 100%
    position absolute
    bottom 0
    left 0
    right 0
    margin-bottom 1rem
    width 100%
    display flex
    color #ccc
    align-items center
    justify-content center
    font-size 1.5rem
    i:first-of-type
      color var(--color-blue)
    i
      margin-right 0.5rem
  svg
    margin-bottom .55rem
@media (max-width: 479.98px)
  .loadingProductCard
    width 100%
    height auto
    svg
      width 100%
      height auto
      margin-bottom 2rem
</style>
