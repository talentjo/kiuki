<template>
  <div class="tagInput">
    <span
      v-for="(tag, index) in value"
      :key="tag + '-' + Math.floor(Math.random() * 999)"
      title="Click to delete"
      class="tagInput__tag"
      @click="deleteTag(index)">{{ tag }}</span>
    <input
      v-if="value.length < max"
      v-model="inputValue"
      type="text"
      placeholder="Add a tag (press Enter)"
      @keyup.enter="addTag(inputValue)">
  </div>
</template>

<script>
export default {
  name: 'TagInput',
  props: {
    value: Array
  },
  data () {
    return {
      inputValue: '',
      max: 20
    }
  },
  methods: {
    addTag (tag) {
      if (tag !== '') {
        this.value.push(tag.replace(/ /g, '').toLowerCase())
        this.inputValue = ''
        this.emitModel()
      }
    },
    deleteTag (index) {
      this.value.splice(index, 1)
      this.emitModel()
      this.$forceUpdate()
    },
    emitModel () {
      this.$emit('input', this.value)
    }
  }
}
</script>

<style scoped lang="stylus">
.tagInput
  display inline-block
  max-width 600px
  &__tag, input
    display inline-block
    border none
    background #fff
    border 2px solid rgba(0,0,0,.1)
    margin 5px
    padding 7px 11px
    font inherit
  &__tag
    background #339af0
    color white
    cursor pointer
    border none
</style>
