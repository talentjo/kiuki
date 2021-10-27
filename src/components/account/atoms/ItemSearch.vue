<template>
  <div class="itemSearch">
    <input
      v-model="input"
      type="text"
      :placeholder="placeholder || 'Search for items...'"
      @input="search($event.target.value)"
      @blur.prevent.stop.self="onBlur"
      @focus="onFocus">
    <i
      v-show="loading"
      class="fal fa-spinner fa-spin itemSearch__loading" />
    <button
      v-show="showDropdown && searchResults.length > 0"
      class="itemSearch__close"
      @mousedown.stop="closeSearch">
      <i class="fal fa-times" />
    </button>
    <div
      v-show="showDropdown"
      class="itemSearch__dropdown">
      <table>
        <tbody>
          <template v-for="result in searchResults">
            <tr
              v-if="
                !includedItemTypes ||
                  includedItemTypes.includes('any') ||
                  includedItemTypes.includes(result.item_type)
              "
              :key="result.id">
              <div class="itemSearch__photo">
                <img :src="result.featured_picture">
              </div>
              <td>{{ result.name.substring(0, 60) }}</td>
              <td>{{ result.item_type }}</td>
              <td>
                <button
                  v-if="
                    selectedItems &&
                      (selectedItems.map(item => item.id).includes(result.id) ||
                      selectedItems
                        .map(item => item.item_name)
                        .includes(result.name))
                  "
                  class="selected">
                  <i class="fal fa-check" />
                </button>
                <button
                  v-else
                  @mousedown.stop.prevent="selectItem(result)">
                  <i class="fal fa-plus" />
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

export default {
  name: 'ItemSearch',
  props: {
    placeholder: {
      required: false,
      type: String
    },
    includedItemTypes: {
      required: false,
      type: Array
    },
    selectedItems: {
      // If items are selected - don't allow to select them again!
      required: false,
      type: Array
    }
  },
  data () {
    return {
      input: '',
      searchResults: [],
      showDropdown: false,
      loading: false
    }
  },
  methods: {
    search (input) {
      if (input.length > 2) {
        this.loading = true
        httpClient.get(`/items?q=${input}&per_page=100`).then((response) => {
          this.searchResults = response.data
          this.loading = false
          this.showDropdown = true
        })
      } else {
        this.searchResults = []
        this.showDropdown = false
      }
    },
    onBlur () {
      this.showDropdown = false
    },
    onFocus () {
      this.showDropdown = true
    },
    selectItem (result) {
      this.$emit('itemSelected', result)
    },
    closeSearch () {
      this.input = ''
      this.showDropdown = false
      this.searchResults = []
    }
  }
}
</script>

<style scoped lang="stylus">
.itemSearch
  position relative
  margin 25px auto
  width 590px
  input
    width 100%
    max-width 590px
    padding 10px 20px
    font inherit
    font-size 16px
    color black
    border 2px solid #ddd
    background #fff
    transition .2s
    &:focus
      border-color dodgerblue
  &__loading
    position absolute
    font-size 20px
    right 22px
    top calc(50% - 10px)
    color black
  &__close
    position absolute
    top calc(50% - 12px)
    right 20px
    background black !important
    color white !important
  &__dropdown
    max-height 400px
    width 590px
    overflow-y scroll
    position absolute
    top 47px
    left 0
    box-shadow 0 5px 6px #ddd
    right 0
    margin 0 auto
    z-index 10
  table
    max-width 590px
    top 60px
    width 100%
    background white
    border-bottom-right-radius 8px
    border-spacing 0
    border-bottom-left-radius 8px
    overflow hidden
    border-top none
    text-align left
    td
      padding 7px 20px
    tr
      padding 20px 0
      border-bottom 1px solid #aaa
      &:last-child
        .itemSearch__photo
          margin-bottom 10px
  button
    border none
    background #ddd
    color black
    width 24px
    line-height 24px
    height 24px
    font-size 14px
    border-radius 50px
    cursor pointer
    display flex
    align-items center
    justify-content center
    transition .12s
    i
      margin-top 2px
    &:hover
      opacity 0.6
  button.selected
    cursor default
    background dodgerblue
    color white
    &:hover
      opacity 1
  &__photo
    width 90px
    margin-top 10px
    height 50px
    overflow hidden
    margin-left 10px
    img
      width 100%
      height 100%
      object-fit cover
</style>
