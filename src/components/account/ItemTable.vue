<template>
  <div class="itemTable">
    <h1>{{ name }}</h1>
    <div class="itemTable__filter">
      <button
        class="filter"
        :active="cardsSize === 'big'"
        @click="cardsSize = 'big'">
        <i class="fal fa-th" />
      </button>
      <button
        class="filter"
        :active="cardsSize === 'medium'"
        @click="cardsSize = 'medium'">
        <i class="fal fa-th-list" />
      </button>
      <button
        class="filter"
        :active="cardsSize === 'small'"
        @click="cardsSize = 'small'">
        <i class="fal fa-list-alt" />
      </button>
      <slot />
    </div>
    <template v-if="loading">
      <ItemCard
        v-for="i in 30"
        :key="`loadingItem_${i}`"
        :size="cardsSize" />
    </template>
    <template v-else-if="items && items.length > 0">
      <ItemCard
        v-for="(item, index) in items"
        :ref="`item_${index}`"
        :key="`item_${index}`"
        :item-data="item"
        :show-remove-button="showRemoveButton"
        :size="cardsSize"
        @itemClicked="clickItem(index)"
        @handleDelete="handleDelete"
        @handleRemove="handleRemove" />
    </template>
    <template
      v-else>
      No items
    </template>
  </div>
</template>

<script>
import ItemCard from '@/components/account/ItemCard.vue'

export default {
  name: 'ItemTable',
  components: {
    ItemCard
  },
  props: {
    name: {
      type: String,
      required: false,
      default: ''
    },
    items: Array,
    loading: Boolean,
    showRemoveButton: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      cardsSize: 'big',
      selectedItems: []
    }
  },
  methods: {
    clickItem (index) {
      this.items[index].isSelected = !this.items[index].isSelected
      this.selectedItems = this.items.filter((item) => item.isSelected === true)
      this.$emit('updateSelectedItems', this.selectedItems)
    },
    handleDelete (itemId) {
      this.$emit('handleDelete', itemId)
    },
    handleRemove (itemId) {
      this.$emit('handleRemove', itemId)
    },
    unselectItems () {
      this.items.forEach((item, index) => {
        item.isSelected = false
        this.$refs[`item_${index}`][0].unselect()
      })
      this.selectedItems = []
      this.$emit('updateSelectedItems', this.selectedItems)
    },
    forceUpdateItems () {
      this.items.forEach((item, index) => {
        this.$refs[`item_${index}`][0].$forceUpdate()
      })
    }
  }
}
</script>

<style scoped lang="stylus">
.itemTable
  display flex
  width 100%
  flex-wrap wrap
  max-width 1100px
  margin 0 auto 40px auto
  text-align left
  gap 10px
  h1
    font-size 20px
    margin-bottom 0
  &__filter
    margin 0 0 10px 0
    width 100%
    display flex
    align-items center
    justify-content flex-start
    padding 3px 5px
    button.filter
      padding 0
      border none
      background transparent
      cursor pointer
      font-size 20px
      margin-right 12px
      color #ccc
      &[active]
        color dodgerblue
</style>
