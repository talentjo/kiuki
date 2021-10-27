<template>
  <div class="star-rating">
    <label
      v-for="(rating, index) in ratings"
      :key="index"
      class="star-rating__star"
      :class="{
        'is-selected': value >= rating && value != null,
        'is-disabled': disabled,
      }"
      @click="set(rating)"
      @mouseover="star_over(rating)"
      @mouseout="star_out">
      <input
        v-model="value"
        class="star-rating star-rating__checkbox"
        type="radio"
        :value="rating"
        :name="name"
        :disabled="disabled">
      ★
    </label>
  </div>
</template>

<script>
export default {
  name: 'RankInput',
  props: {
    name: String,
    value: null,
    id: String,
    disabled: Boolean,
    required: Boolean
  },
  data () {
    return {
      temp_value: this.value,
      ratings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  },
  watch: {
    value (newValue) {
      this.inputValue = newValue
    },
    temp_value (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    /*
     * Behaviour of the stars on mouseover.
     */
    star_over (index) {
      if (!this.disabled) {
        this.temp_value = index
      }
    },

    /*
     * Behaviour of the stars on mouseout.
     */
    star_out () {
      if (!this.disabled) {
        return this.temp_value
      }
    },

    /*
     * Set the rating.
     */
    set (value) {
      if (!this.disabled) {
        this.temp_value = value
      }
    }
  }
}
</script>

<style lang="stylus">
.visually-hidden {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
}

.star-rating {
  &__star {
    display: inline-block;
    padding: 3px;
    vertical-align: middle;
    line-height: 1.5;
    font-size: 1.5em;
    color: #ABABAB;
    transition: color .2s ease-out;

    &:hover {
      cursor: pointer;
    }

    &.is-selected {
      color: #FFD700;
    }

    &.is-disabled:hover {
      cursor: default;
    }
  }

  &__checkbox {
    @extend .visually-hidden
  }
}
</style>
