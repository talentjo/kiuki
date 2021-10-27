<template>
  <div
    class="loadingBox"
    :style="{
      width,
      height,
      borderRadius: round ? '1000px' : '0',
    }" />
</template>

<script lang="ts">
export default {
  name: 'LoadingBox',
  props: {
    width: String,
    height: String,
    round: Boolean
  }
}
</script>

<style scoped lang="stylus">
.loadingBox
  display: inline-block
  margin-right: 3px
  background: linear-gradient(to bottom, #c3c3c3, #fff)
  animation-name: loading
  animation-duration: 1s
  animation-iteration-count: infinite

@keyframes loading {
  0% {
    background: #f2f2f2;
  }
  50% {
    background: #e9e9e9;
  }
  100% {
    background: #f2f2f2;
  }
}
</style>
