<template>
  <div
    v-click-outside="() => isOpen && $emit('closeMobileMenu')"
    class="mobileMenu"
    :class="{ '--hidden': !isOpen }">
    <button
      class="hideMenuButton"
      @click.stop="$emit('closeMobileMenu')">
      <i class="fal fa-times" />
    </button>
    <MagicMenu
      :categories="categories"
      :is-mobile="true"
      @close="$emit('closeMobileMenu')" />
  </div>
</template>

<script>
import MagicMenu from '@/components/MagicMenu.vue'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'MobileMenu',
  components: {
    MagicMenu
  },
  directives: {
    ClickOutside
  },
  props: {
    categories: Object,
    isOpen: Boolean
  },
  watch: {
    isOpen (isOpen) {
      const htmlElement = document.querySelector('html')
      if (isOpen) {
        htmlElement.style = 'overflow: hidden'
      } else {
        htmlElement.style = ''
      }
    }
  },
  data () {
    return {}
  }
}
</script>

<style scoped lang="stylus">
.mobileMenu
  position fixed
  overflow-y auto
  height 100%
  width 100%
  max-width 20rem
  background-color #fff
  top 0
  left 0
  z-index 1000
  padding 1.4375rem
  box-shadow: 0 0 24px rgba(0,0,0,.01);
  transition all .5s cubic-bezier(.785,.135,.15,.86);
  &.--hidden
    transform translateX(-100%)
.hideMenuButton
  background transparent
  border none
  padding .5rem
  position absolute
  top .5rem
  right .5rem
  width 2.25rem
  height 2.25rem
  right 0
  cursor pointer
  i
    font-size 1.25rem

@media screen and (min-width: 992px)
  .mobileMenu
    display none
</style>
