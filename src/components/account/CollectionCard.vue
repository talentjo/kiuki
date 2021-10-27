<template>
  <div
    class="collecitonCardWrapper"
    :style="{ width: size === 'small' ? '100%' : 'auto' }">
    <div
      class="collectionCard"
      :class="`collectionCard--${size}`">
      <template v-if="collectionData">
        <div class="collectionCard__background">
          <v-lazy-image
            v-for="item in collectionData.items"
            :key="`collection_image_${item.id}`"
            class="itemCard__image"
            :src="item.featured_picture + '?width=144'"
            :src-placeholder="item.featured_picture + '?width=30'"
            width="72" />
        </div>
      </template>
      <template v-else>
        <loading-box
          width="100%"
          height="100%" />
      </template>
      <footer>
        <h1>{{ name }}</h1>
        <button
          title="Delete"
          red
          @click.stop="$emit('handleDelete', collectionData.name)">
          <i class="fal fa-trash-alt" />
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import VLazyImage from 'v-lazy-image'
import LoadingBox from '@/components/account/atoms/LoadingBox.vue'

export default {
  name: 'CollectionCard',
  components: {
    VLazyImage,
    LoadingBox
  },
  props: {
    collectionData: Object,
    size: {
      required: false,
      default: 'big'
    }
  },
  data () {
    return {
      selected: false
    }
  },
  computed: {
    name () {
      if (this.collectionData) {
        return this.collectionData.name
      }
      return ''
    }
  }
}
</script>

<style scoped lang="stylus">
.collecitonCardWrapper
  display inline-flex
  justify-content center
  align-items center
  padding 7px

.collectionCard
  position relative
  text-align left
  word-break break-word
  background-color white
  box-shadow 0 2px 8px rgba(0, 0, 0, .08)
  box-sizing border-box
  background black
  color white
  cursor pointer
  transition background-color .1s, border .1s
  overflow hidden
  &--big
    width 160px
    height 263px
    footer
      position absolute
      bottom 6px
      right 6px
  &--medium
    width 500px
    height auto
    padding 8px 43px 8px 8px
    display flex
    align-items center
    justify-content flex-start
    h1
      margin 0  0 0 12px !important
    footer
      position absolute
      right 8px
      margin-top 0 !important
      flex-direction column
      width auto !important
      button
        margin 3px 0
  &--small
    display flex
    align-items center
    justify-content flex-start
    width 100%
    white-space nowrap
    .collectionCard__image
      display none !important
    h1
      margin-top 0 !important
    footer
      margin-top 0 !important
      width auto !important
  &__background
    position absolute
    left 0
    top 0
    display grid
    grid-template 1fr 1fr 1fr / 1fr 1fr 1fr
    gap 0
    opacity .8
    z-index 1
  h1
    font-size 20px
    line-height 22px
    margin 0 0 0 15px
    font-weight 800
    max-width 100px
    color white
    text-shadow 0 0 12px black
    z-index 2
  footer
    width 100%
    margin 8px 0 0 0
    display flex
    align-items center
    justify-content space-between
    z-index 2
    button
      width 28px
      height 28px
      background-color #f3f3f3
      color #666
      padding 3px
      border none
      cursor pointer
      margin-left 8px
      border-radius 50px
      transition opacity .1s
      font-size 16px
      &[red]
        background-color #fff5f6
        color #ff4e4e
      &:hover
        opacity .8
</style>
