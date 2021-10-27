<template>
  <div class="timeInput">
    <vue-timepicker
      v-model="time"
      format="HH:mm"
      close-on-complete
      auto-scroll />
  </div>
</template>

<script>
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'

export default {
  name: 'TimeInput',
  components: {
    VueTimepicker
  },
  props: {
    value: String
  },
  computed: {
    time: {
      get () {
        const model = {
          HH: this.value.substring(0, 2),
          mm: this.value.substring(2)
        }
        return model
      },
      set (newValue) {
        this.$emit('input', newValue.HH + newValue.mm)
      }
    }
  }
}
</script>

<style lang="stylus">
.time-picker input.display-time
  height 39px
  border 2px solid rgba(0, 0, 0, .1)
  transition border-color .3s
  &:focus
    border-color dodgerblue
.time-picker .dropdown ul li.active, .time-picker .dropdown ul li.active
  background dodgerblue
  color white
  &:hover
    background dodgerblue
.timeInput
  display inline-block
</style>
