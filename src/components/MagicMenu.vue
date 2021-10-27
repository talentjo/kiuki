<template>
  <nav
    class="magicMenu"
    :class="[{ hasTopMargin: hasTopMargin }, { isMobile: isMobile }, { 'magicMenu--show': show }]"
    v-select-click-outside="handleClickOutside"
  >
    <transition-group
      class="list"
      name="list">
      <router-link
        v-for="(categories, key) in browsedCategories[
          browsedCategories.length - 1
        ].categories"
        :key="key"
        class="list-item"
        :to="`/${categories.link}`"
        :class="[
          { 'list-item--selected': key === $route.params.categoryName },
          { 'list-item--highlighted': categories.highlighted },
          { 'list-item--mobile': isMobile },
        ]"
        @click.native="isMobile && $emit('close'); $emit('closeDesktopMagicMenu')">
        <img
          v-if="categories.iconURL"
          :src="categories.iconURL">
        <p>{{ categories.name || key }}</p>
        <div class="highlightedIndicator" />
      </router-link>
    </transition-group>
  </nav>
</template>

<script>
// Navigation component with configurable categories, subcategories, subsubsubcate... you can add as many of them as you wish!
export default {
  name: 'MagicMenu',
  props: {
    categories: Object,
    hasTopMargin: Boolean,
    isMobile: Boolean,
    show: Boolean
  },
  data () {
    return {
      // Enables user to go back to previous category list
      browsedCategories: [],
      lastCategoryName: '',
      lastCategory: {}
    }
  },
  watch: {
    $route: {
      handler () {
        this.$nextTick(() => {
          this.getCollectionNames()
        })
      },
      immediate: true
    }
  },
  created () {
    //
    // Push current category configuration to history
    this.browsedCategories.push(this.categories)
    this.getCollectionNames()
  },
  methods: {
    handleClickOutside (e) {
      if (e.target) {
        if (
          !e.target.classList.contains('magicMenu') &&
          !e.target.closest('.magicMenu')
        ) {
          this.$emit('closeDesktopMagicMenu')
        }
      }
    },
    // When a category button is clicked - show user its subcategories
    handleButtonClick (newCategories, key) {
      console.log('buttonClick: ', newCategories, key)
      if (newCategories.categories && key !== this.lastCategoryName) {
        this.$router.push(`/${key}`)
      } else {
        this.$router.replace(`/${key}`)
      }
    },
    handleGoBack () {
      if (
        this.$route.name !== 'categoryPage' &&
        this.$route.name !== 'itemPage'
      ) {
        history.go(-1)
        return
      }
      const { categoryName } = this.$route.params
      const category = this.getCategory(this.categories, categoryName)
      if (this.categories.categories[categoryName]) {
        this.$router.replace('/')
        this.lastCategoryName = ''
        this.lastCategory = {}
        return
      }
      if (category.categories) {
        this.browsedCategories.pop()
      }
      this.$router.back()
    },
    getCollectionNames () {
      // the below if condition is used to prevent the magicmenu from resetting on following paths, in future we should have an exceptionPaths prop
      if (
        this.$route.name !== 'categoryPage' &&
        this.$route.name !== 'itemPage'
      ) {
        this.browsedCategories.push(this.categories)
        this.lastCategoryName = ''
        this.lastCategory = {}
        return
      }
      const { categoryName } = this.$route.params
      const category = this.getCategory(this.browsedCategories[0], categoryName)
      if (!category) return
      const collection = this.getCollectionsForCategory(category)
      this.$store.commit('setCollectionNames', collection)
    },
    getCategory (category, name) {
      if (!category.categories) return undefined
      return Object.entries(category.categories)
        .map(([subcategoryName, subcategory]) => {
          if (subcategory.link === name) {
            return subcategory
          }
          return this.getCategory(subcategory, name)
        })
        .filter((e) => e !== undefined)[0]
    },
    getParentCategory (category, name) {
      if (!category.categories) return undefined
      return Object.entries(category.categories)
        .map(([subcategoryName, subcategory]) => {
          if (subcategory.categories && subcategory.categories[name]) {
            return { data: subcategory, name: subcategoryName }
          }
          return this.getParentCategory(subcategory, name)
        })
        .filter((e) => e !== undefined)[0]
    },
    getCollectionsForCategory (category) {
      /*
        You shall not try to understand how this function works,
        for the author himself has not acquired that knowledge yet.
        ...
        However, I can bless you with the power of knowing what this function does.
        It delves deeply into all menu categories presented to it,
        combining a list of all collection names found inside of them, and returns that list.
      */
      if (!category.categories) return category.collection
      return Object.values(category.categories)
        .map((subcategory) => this.getCollectionsForCategory(subcategory))
        .join(',')
        .split(',')
        .filter((e) => e !== '')
    }
  }
}
</script>

<style scoped lang="stylus">
.magicMenu
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  text-align left
  box-sizing border-box
  border-radius 8px
  transition all .2s
  background-color #FFF
  position: absolute
  min-width: 200px
  top 180px
  z-index 3
  padding 15px
  box-shadow 0 10px 30px rgba(0, 0, 0, 0.15)
  display none
  &--show
    display block
  @media screen and (max-width: 991.98px)
    display block
    box-shadow none
    padding: 5px
    position static !important
    max-height unset
  &.isMobile
    margin-top 1rem
  &.hasTopMargin
    margin-top -3.7rem
  button
    cursor pointer
    font-family inherit
    border none
    background transparent
    p
      margin 0
    &.lastCategoryBtn
      color #FC9B8E
      font-weight 600
  .goBack
    transition-duration .2s
    opacity 0
    color #6e6d7a
    display none
    &--deadEnd
      animation-name appear
      animation-duration .2s
      animation-fill-mode forwards
    &--visible
      opacity 1
      display block
    &--invisible
      opacity 0
      display none

@keyframes appear
  from
    opacity 0
    transform translateY(30px)
  to
    opacity 1
    transform translateY(0)

.list
  width 100%
  height 100%
  display flex
  flex-direction column
  padding-bottom .3rem

.list-item
  flex-shrink 0
  margin .6rem 0
  z-index 2
  color #6e6d7a
  display inline-flex
  width fit-content
  align-items center
  font-size .9375rem
  position relative
  img
    height 1.5rem
    display block
    margin-right .75rem
    z-index 10
  p
    margin: 0
  &--mobile
    font-size .875rem
    img
      height 2rem
  &--mobile&--highlighted
    margin-top .25rem
    p
      bottom .2rem
    .highlightedIndicator
      height 1.5rem
  &--selected
    color #05A570
    font-weight 600
  &--highlighted
    color #05A570
    padding-right .75rem
    margin-bottom .5rem
    align-items flex-end
    p
      z-index 10
      margin 0
      position relative
      bottom .45rem
    .highlightedIndicator
      position absolute
      bottom 0
      background-color #F9EFED
      width 100%
      height 2rem
      border-radius 1rem
      border 1px solid #05A570
      transition 200ms ease-in-out
.list-enter-active, .list-leave-active
  transition all 0.5s

.list-enter
  opacity 0
  transform translateY(200px)

.list-leave-to
  transform translateY(-40px)

.list-move
  transition transform .2s

.list-leave-active
  position absolute
  left 0
  opacity 0
  z-index -1
</style>
