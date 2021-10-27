<template>
  <div
    v-show="isActive"
    class="tab__content">
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Tab'
    }
  },
  data () {
    return {
      isActive: true
    }
  }
}
</script>

<style lang="css">
.tab__content {
    width: 100%;
}
</style>
