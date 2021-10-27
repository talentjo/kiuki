<template>
  <div class="table">
    <div class="table__row table__row--sticky">
      <div
        v-for="column in columns"
        :key="`column_${column}`"
        class="table__cell">
        <b>{{ column }}</b>
      </div>
    </div>
    <div
      v-for="(item, itemIndex) in tableData"
      :key="item.id"
      class="table__row"
      :class="{
        'table__row--selected': item.isSelected,
        'table__row--clickable': clickable,
      }"
      @click="
        () => {
          if (clickable) {
            clickRow(itemIndex)
          }
        }
      ">
      <div
        v-for="row in rows"
        :key="`row_${row}`"
        class="table__cell">
        <p v-if="row === 'creator'">
          {{ item[row].name + '-' + item[row].email }}
        </p>
        <p v-else>
          {{ item[row] }}
        </p>
      </div>
      <div class="table__cell">
        <slot :rowData="item" />
      </div>
    </div>
    <div
      v-if="tableData.length === 0"
      style="padding: 10px 20px; text-align: left; margin: 0 auto;">
      List is empty
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueTable',
  props: {
    rows: Array,
    columns: Array,
    tableData: Array,
    clickable: Boolean
  },
  methods: {
    clickRow (index) {
      this.tableData[index].isSelected = !this.tableData[index].isSelected
      this.$emit(
        'selectedItemsUpdated',
        this.tableData.filter((item) => item.isSelected === true)
      )
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang="stylus">
.table
  margin 10px auto
  max-width 1000px
  border-collapse separate
  border-radius 5px
  &__cell
    width 100%
    height 100%
    padding 0 20px
    border-right 1px solid #ccc
    display flex
    align-items center
    justify-content space-between
    p, b
      margin 6px 0
    &:nth-child(1)
      width auto
      min-width 250px
    &:last-child
      width auto
      min-width 100px
      border-right none
  &__row
    position relative
    text-align left
    width 100%
    background-color white
    display flex
    justify-content space-between
    border-bottom 1px solid #ccc
    border-left 1px solid #ccc
    border-right 1px solid #ccc
    align-items center
    &--clickable
      cursor pointer
      &:hover
        box-shadow 0 1px 2px #999, 0 0 1px #777
        z-index 2
    &--sticky
      top 0
      position sticky
      cursor default
      border-radius 0
      padding 3px 0
      border 1px solid #ccc
      z-index 2
      &:hover
        box-shadow none
    &--selected
      background-color #c3dbff
</style>
