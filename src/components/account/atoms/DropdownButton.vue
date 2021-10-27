<template>
  <div
    v-click-outside="
      () => {
        dropdownOpen = false
      }
    "
    class="dropdownButton"
    :class="{ 'dropdownButton--small': size === 'small' }"
    @click="dropdownOpen = !dropdownOpen">
    <slot />
    <div
      class="dropdownButton__arrow"
      :class="{ 'dropdownButton__arrow--rotated': dropdownOpen }">
      <i class="fal fa-chevron-down" />
    </div>
    <div
      class="dropdownButton__dropdown"
      :class="{ 'dropdownButton__dropdown--open': dropdownOpen }">
      <div class="dropdownButton__dropdownContainer">
        <template v-if="buttons">
          <router-link
            v-for="button in buttons"
            :key="`button_${button.name}`"
            tag="button"
            :to="button.to">
            {{ button.name }}
          </router-link>
        </template>
        <template v-else>
          <div @click.stop="">
            <slot name="content" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'

export default {
  name: 'DropdownButton',
  directives: {
    ClickOutside
  },
  props: {
    buttons: Array,
    size: String
  },
  data () {
    return {
      dropdownOpen: false
    }
  }
}
</script>

<style scoped lang="stylus">
.dropdownButton
  margin-top 12px
  position relative
  width 200px
  padding 10px
  height 40px
  background-color white
  box-shadow 0 2px 8px rgba(0, 0, 0, .08)
  cursor pointer
  transition background-color .1s, transform .12s
  display flex
  align-items center
  justify-content flex-start
  z-index 2
  &:hover
    background-color #fcfcfc
    transform scale(1.03)
  &--small
    height 32px
    margin-top 0
  &__arrow
    position absolute
    top calc(50% - 8px)
    right 10px
    color #666
    transition transform .13s
    transition-timing-function ease-in-out
    &--rotated
      transform rotate(180deg)
  &__photo
    width 32px
    height 32px
    margin-right 8px
    border-radius 50px
    background-color #f3f3f3
    background-size cover
    background-position center
    background-repeat no-repeat
  p
    margin 0
  &__dropdown
    width 100%
    position absolute
    top 100%
    max-height 0px
    left 0
    background #222
    overflow hidden
    transition max-height .12s
    transition-timing-function ease-in-out
    box-shadow 0 2px 8px rgba(0, 0, 0, .08)
    overflow-y scroll
    color white
    div
      padding 3px
      cursor default
    button
      width 100%
      padding 6px 10px
      font-weight 600
      color white
      border none
      cursor pointer
      background-color transparent
      text-align left
      font-size 12px
      transition background-color .08s
      &:hover
        background-color rgba(255, 255, 255, .05)
    &--open
      max-height 203px
  &__dropdownContainer
    width 100%
    height auto

.router-link-exact-active
  background-color dodgerblue
</style>
