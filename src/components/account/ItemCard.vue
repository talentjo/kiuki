<template>
  <div
    class="itemCardWrapper"
    :style="{ width: size === 'small' ? '100%' : 'auto' }">
    <div
      class="itemCard"
      :class="[`itemCard--${size}`, selected ? 'itemCard--selected' : '']"
      @click="
        selected = !selected
        $emit('itemClicked')
      ">
      <template v-if="itemData">
        <v-lazy-image
          v-if="image"
          class="itemCard__image"
          :src="image + '?width=286'"
          :src-placeholder="image + '?width=30'"
          width="143" />
        <i
          v-else
          class="itemCard__image fal fa-shopping-cart"
        />
        <div>
          <h1 :title="itemData.name">
            {{ name }}
          </h1>
          <p :title="itemData.description">
            {{ trimmedDescription }}
          </p>
          <div
            v-if="itemData && itemData.collections"
            :title="
              `Collections: ${itemData.collections
                .toString()
                .split(',')
                .join(' | ')}`
            ">
            <span
              v-for="collection in itemData.collections.slice(0, 7)"
              :key="`collection_${itemData.id}-${collection}`"
              class="itemCard__collection"
              :title="collection">
              {{ trimmedCollection(collection) }}
            </span>
          </div>
        </div>
      </template>
      <template v-else>
        <loading-box
          v-if="size !== 'small'"
          width="100%"
          height="100px"
          :style="{
            maxWidth: size === 'big' ? 'auto' : '100px',
            marginRight: size === 'big' ? '0' : '10px',
          }" />
        <div v-if="size !== 'small'">
          <loading-box
            style="margin-top: 2px"
            width="130px"
            height="17px" />
          <loading-box
            style="margin-top: 4px"
            width="135px"
            height="14px" />
          <loading-box
            width="75px"
            height="14px" />
          <loading-box
            v-if="size === 'big'"
            width="115px"
            height="14px" />
          <loading-box
            v-if="size === 'big'"
            width="80px"
            height="14px" />
        </div>
        <div v-else>
          <loading-box
            width="190px"
            height="17px" />
          <loading-box
            width="255px"
            height="14px" />
        </div>
      </template>
      <footer>
        <button
          title="Edit"
          @click.stop="
            $router.push(`/account/edit/${itemData.item_type}/${itemData.id}`)
          ">
          <i class="fal fa-pen" />
        </button>
        <button
          title="View on Veganbase"
          @click.stop="openVeganbase">
          <i class="fal fa-eye" />
        </button>
        <button
          v-if="showRemoveButton"
          title="Remove from collection"
          red
          @click.stop="$emit('handleRemove', itemData.id)">
          <i class="fal fa-times" />
        </button>
        <button
          v-else
          title="Delete"
          red
          @click.stop="$emit('handleDelete', itemData.id)">
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
  name: 'ItemCard',
  components: {
    VLazyImage,
    LoadingBox
  },
  props: {
    itemData: Object,
    size: {
      required: false,
      default: 'big'
    },
    showRemoveButton: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      selected: false
    }
  },
  computed: {
    name () {
      if (this.itemData.name.length > 55) {
        return `${this.itemData.name.substring(0, 52)}...`
      }
      return this.itemData.name
    },
    trimmedDescription () {
      if (this.itemData.description.length > 50) {
        return `${this.itemData.description.substring(0, 47)}...`
      }
      return this.itemData.description
    },
    image () {
      return this.itemData.featured_picture
    }
  },
  methods: {
    openVeganbase () {
      window.open(`https://veganbase.com/${this.itemData.slug}`, '_blank')
    },
    unselect () {
      this.selected = false
    },
    trimmedCollection (collection) {
      if (collection.length > 7) {
        return `${collection.substring(0, 7)}...`
      }
      return collection
    }
  }
}
</script>

<style scoped lang="stylus">
.itemCardWrapper
  display inline-flex
  justify-content center
  align-items center
  padding 7px

.itemCard
  position relative
  background-color white
  box-shadow 0 2px 8px rgba(0, 0, 0, .08)
  box-sizing border-box
  cursor pointer
  padding 8px
  transition background-color .1s, border .1s
  border 1px solid white
  &:hover
    background-color #fcfcfc
  &--selected
    box-shadow 0 0 6px dodgerblue
    border 1px solid dodgerblue
  &--big
    width 160px
    height 323px
    footer
      position absolute
      bottom 6px
      right 6px
  &--medium
    width 520px
    height auto
    padding 8px 43px 8px 8px
    display flex
    align-items center
    justify-content flex-start
    p, h1
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
    .itemCard__image
      display none !important
    h1
      margin-top 0 !important
    p
      margin 0  0 0 10px !important
    div
      width 100%
      display flex
      align-items center
      justify-content flex-start
    footer
      margin-top 0 !important
      width auto !important
  .itemCard__image
    display block
    margin 0
    height 100px
    object-fit contain
    border-radius 7px
  i.itemCard__image
    font-size 30px
    color #ccc
    display flex
    align-items center
    justify-content center

  h1
    font-size 15px
    margin 5px 2px 2px 2px
    font-weight 500
    line-height 17px
    color black
  p
    margin 0
    word-break break-word
    color #555
  &__collection
    margin 2px 0
    display inline-block
    color white
    background-color dodgerblue
    border-radius 50px
    padding 1px 7px
    font-size 11px
    white-space nowrap
    margin-right 3px
    font-weight 700
  footer
    width 100%
    margin 8px 0 0 0
    display flex
    align-items center
    justify-content flex-end
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
