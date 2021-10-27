<template>
  <div class="ingredients">
    <p>
      <span
        v-for="(ingredient, index) in ingredients"
        :key="index">
        {{ ingredient.name }}
        <span
          v-if="
            ingredient.percentage ||
              ingredient.organic ||
              ingredient.allergen ||
              ingredient.percentage_is_min ||
              ingredient.percentage_is_max
          ">
          ( {{ ingredient.percentage ? `${ingredient.percentage}%` : null }}
          {{ ingredient.organic ? 'organic' : null }}
          {{ ingredient.allergen ? 'allergen' : null }}
          {{ ingredient.percentage_is_min ? 'min percentage' : null }}
          {{ ingredient.percentage_is_max ? 'max percentage' : null }}
          ),
        </span>
      </span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Ingredients',
  props: {
    ingredients: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="stylus">
.ingredients
  width 100%
  text-align left
</style>
