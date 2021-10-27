<template>
  <div
    v-show="show"
    class="modalBox">
    <div
      v-click-outside="() => (show = false)"
      class="modalBox__container"
      :style="{ minHeight: icon ? '300px' : '300px' }">
      <h3>{{ title }}</h3>
      <div
        v-if="icon"
        class="modalBox__bigIcon">
        <i :class="'fal fa-' + icon" />
      </div>
      <button
        class="modalBox__close"
        @click="show = false">
        <i class="fal fa-times" />
      </button>
      <br>
      <br>
      <slot />
      <footer v-if="type !== 'no-footer'">
        <template v-if="type === 'confirm'">
          <p @click="show = false">
            No
          </p>
          <b @click="handleConfirm()">Yes</b>
        </template>
        <template v-else-if="type === 'add'">
          <p @click="show = false">
            Cancel
          </p>
          <b @click="handleConfirm()">Add</b>
        </template>
        <template v-else>
          <p
            @click="
              show = false
              handleConfirm()
            ">
            Ok
          </p>
        </template>
      </footer>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'

export default {
  name: 'ModalBox',
  directives: {
    ClickOutside
  },
  props: {
    title: String,
    icon: String,
    type: String
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    handleConfirm () {
      this.$emit('onConfirm')
      this.show = false
    }
  }
}
</script>

<style scoped lang="stylus">
.modalBox
  text-align center
  position fixed
  width 100%
  height 100%
  top 0
  left 0
  display flex
  align-items center
  background-color rgba(0, 0, 0, .3)
  justify-content center
  z-index 999
  &__container
    position relative
    width 500px
    padding 20px 20px 35px 20px
    background-color white
  &__bigIcon
    margin 0 auto
    display inline-block
    width 50px
    height 50px
    text-align center
    font-size 50px
  &__close
    position absolute
    top 8px
    right 12px
    height 20px
    width 20px
    color #ccc
    border none
    background-color transparent
    cursor pointer
    font-size 20px
  footer
    position absolute
    bottom 5px
    height 50px
    width 90%
    margin 0 auto
    border-top 1px solid #eee
    display flex
    align-items center
    justify-content space-around
    *
      cursor pointer
</style>
