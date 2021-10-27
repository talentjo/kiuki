<template>
  <div class="pictureDisplayer">
    <div
      class="pictureDisplayer__mainPicture"
      :style="{ backgroundImage: `url(${imgix(pictures[selectedPictureIndex], { height: 400 })})` }" />
    <div class="pictureDisplayer__miniatures">
      <div
        id="pictureContainer"
        class="pictureDisplayer__container">
        <div
          v-bind:key="`url(${picture})`"
          v-for="(picture, index) in pictures"
          class="pictureDisplayer__miniature"
          :style="{ backgroundImage: `url(${imgix(picture, { height: 80 })})` }"
          @click="selectedPictureIndex = index" />
      </div>
      <div
        v-if="pictures.length > 4"
        class="pictureDisplayer__arrow pictureDisplayer__arrow--left"
        @click="scrollLeft">
        <i class="fal fa-chevron-left" />
      </div>
      <div
        class="pictureDisplayer__arrow pictureDisplayer__arrow--right"
        @click="scrollRight">
        <i class="fal fa-chevron-right" />
      </div>
    </div>
  </div>
</template>

<script>
import imgix from '@/services/imgix'
export default {
  name: 'PictureDisplayer',
  props: {
    pictures: {
      required: true,
      type: Array
    }
  },
  data () {
    return {
      selectedPictureIndex: 0
    }
  },
  methods: {
    scrollRight () {
      const element = document.getElementById('pictureContainer')
      element.scrollBy({ left: 60, behavior: 'smooth' })
    },
    scrollLeft () {
      const element = document.getElementById('pictureContainer')
      element.scrollBy({ left: -60, behavior: 'smooth' })
    },
    imgix
  }
}
</script>

<style scoped lang="stylus">
.pictureDisplayer
  width 100%
  height 500px
  margin 0
  min-width 300px
  max-width 350px
  display flex
  flex-direction column
  &__mainPicture
    width 100%
    height 100%
    background-color #fff
    background-size contain
    background-repeat no-repeat
    background-position 50%
  &__miniatures
    position relative
    width 100%
    overflow hidden
    min-height 100px
  &__container
    width auto
    height calc(100% + 20px)
    overflow-x scroll
    -webkit-overflow-scrolling touch
    display flex
    align-items center
    justify-content flex-start
  &__miniature
    display inline-block
    min-width 60px
    height 80px
    margin-right 8px
    background-size cover
    background-position center
    background-color white
    cursor pointer
  &__arrow
    position absolute
    font-size 22px
    color white
    padding 5px
    top calc(50% - 11px)
    cursor pointer
    z-index 2
    &--left
      left 2px
    &--right
      right 2px
@media screen and (max-width: 779.98px)
  .pictureDisplayer
    min-width 100%
    max-width 100%
  .pictureDisplayer__mainPicture
    margin auto
</style>
