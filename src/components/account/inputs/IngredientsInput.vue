<template>
  <div class="ingredientsInput">
    <template v-if="ingredients.length === 0">
      <div class="ingredientsInput__ingredient">
        <span>
          <h1>Ingredients Input</h1>
          <h2>Add a list of ingredients!</h2>
        </span>
      </div>
      <div class="ingredientsInput__divider" />
    </template>
    <div class="ingredientsInput__ingredients">
      <ul>
        <li
          v-for="(ingredient, index) in ingredients"
          :key="`ingredient_${index}`"
          class="ingredientsInput__ingredient">
          <button
            class="ingredientsInput__close-button ingredientsInput__close-button--right-middle"
            style="right: 50px;"
            @click="
              creatorOpen = true
              itemType === 'dish'
                ? (dishIngredient = ingredient)
                : (newIngredient = ingredient)
              ingredients.splice(index, 1)
            ">
            <i class="fal fa-pencil" />
          </button>
          <button
            class="
              ingredientsInput__close-button
              ingredientsInput__close-button--right-middle
            "
            @click="ingredients.splice(index, 1)">
            <i class="fal fa-trash-alt" />
          </button>
          <template v-if="itemType === 'dish'">
            {{ ingredient }}
          </template>
          <template v-else>
            <b>{{ ingredient.name }} &nbsp; </b>
            <span v-if="ingredient.quantity && ingredient.quantity.length > 0">
              {{ ingredient.quantity }}&nbsp;
            </span>
            <span v-if="ingredient.unit && ingredient.unit.length > 0">
              {{ ingredient.unit }}
            </span>
            <span v-if="ingredient.percentage">
              {{ ingredient.percentage }}%,&nbsp;
            </span>
            <span v-if="ingredient.organic">
              organic,&nbsp;
            </span>
            <span v-if="ingredient.has_rda">
              has RDA,&nbsp;
            </span>
            <span v-if="ingredient.allergen">
              contains allergen.
            </span>
          </template>
        </li>
      </ul>
    </div>
    <div v-if="creatorOpen">
      <h3 v-if="newIngredient.name && newIngredient.name.length > 0">
        Edit ingredient:
      </h3>
      <h3 v-else>
        Add a new ingredient:
      </h3>
      <TextInput
        v-if="itemType === 'dish'"
        v-model="dishIngredient"
        placeholder="Name" />
      <TextInput
        v-else
        v-model="newIngredient.name"
        placeholder="Name" />
      <div v-if="itemType === 'recipe'">
        <TextInput
          v-model="newIngredient.quantity"
          placeholder="Quantity" />
        <TextInput
          v-model="newIngredient.unit"
          placeholder="Unit" />
      </div>
      <div v-else-if="itemType !== 'dish'">
        <span>Percentage(%): &nbsp;</span>
        <NumberInput
          v-model="newIngredient.percentage"
          name="percentage"
          min="0"
          max="100"
          :large="false" />
        <br>
        <span>
          <input
            v-model="newIngredient.organic"
            type="checkbox"
            name="organic">
          <label for="organic">Organic</label>
        </span>
        <span>
          <input
            v-model="newIngredient.allergen"
            type="checkbox"
            name="allergen">
          <label for="allergen">Allergen</label>
        </span>
        <br>
        <span>
          <label for="percentage_is_min">Percentage is min? (optional)</label>
          <input
            v-model="newIngredient.percentage_is_min"
            type="checkbox"
            name="percentage_is_min">
        </span>
        <br>
        <span>
          <label for="percentage_is_max">Percentage is max? (optional)</label>
          <input
            v-model="newIngredient.percentage_is_max"
            type="checkbox"
            name="percentage_is_max">
        </span>
      </div>
      <!-- TODO: Sub ingredients -->
      <br>
      <button
        class="ingredientsInput__blue-button"
        @click="
          itemType === 'dish'
            ? addNewIngredient(dishIngredient)
            : addNewIngredient(newIngredient)
        ">
        <i
          v-if="newIngredientLoading"
          class="fal fa-spinner-third fa-spin" />
        <span v-else>
          Add
        </span>
      </button>
      <span
        style="cursor: pointer;"
        @click="creatorOpen = false">
        &nbsp; Cancel
      </span>
    </div>
    <button
      v-if="!creatorOpen"
      class="
        ingredientsInput__ingredient
        ingredientsInput__ingredient--button
      "
      @click="creatorOpen = true">
      <div class="ingredientsInput__image">
        <i class="fal fa-plus-square" />
      </div>
      <span>
        <h1>Add ingredients</h1>
      </span>
    </button>
  </div>
</template>

<script>
import TextInput from '@/components/account/inputs/TextInput.vue'
import NumberInput from '@/components/account/inputs/NumberInput.vue'

export default {
  name: 'IngredientsInput',
  components: {
    TextInput,
    NumberInput
  },
  props: {
    value: {
      required: false,
      default: () => []
    },
    itemType: {
      type: String,
      required: true,
      default: 'packagedfood'
    }
  },
  data () {
    return {
      creatorOpen: false,
      ingredients: [],
      newIngredientLoading: false,
      dishIngredient: '',
      newIngredient: {
        name: '',
        organic: false,
        allergen: false,
        percentage: 0,
        percentage_is_max: false,
        percentage_is_min: false,
        sub_ingredients: [],

        // For recipe
        unit: '',
        quantity: ''
      }
    }
  },
  mounted () {
    this.getIngredients()
  },
  watch: {
    value: {
      handler () {
        this.getIngredients()
      },
      deep: true
    }
  },
  methods: {
    async addNewIngredient (ingredient) {
      if (this.itemType === 'dish') {
        this.newIngredientLoading = true
        this.ingredients.push(ingredient)
        this.$emit('input', this.ingredients)
        this.dishIngredient = ''
        this.creatorOpen = false
        this.newIngredientLoading = false
      } else {
        try {
          this.newIngredientLoading = true
          if (this.itemType === 'recipe') {
            if (ingredient.unit && ingredient.unit.length === 0) {
              delete ingredient.unit
            }
            if (ingredient.quantity && ingredient.quantity.length === 0) {
              delete ingredient.quantity
            }
            delete ingredient.percentage
            delete ingredient.organic
            delete ingredient.allergen
            delete ingredient.percentage_is_max
            delete ingredient.percentage_is_min
            delete ingredient.sub_ingredients
          } else {
            if (ingredient.percentage && ingredient.percentage === 0) {
              delete ingredient.percentage
            }
            delete ingredient.unit
            delete ingredient.quantity
          }
          this.ingredients.push(ingredient)
          this.$emit('input', this.ingredients)
          this.newIngredient = {
            name: '',
            organic: false,
            allergen: false,
            percentage: 0,
            percentage_is_max: false,
            percentage_is_min: false,
            sub_ingredients: [],
            unit: '',
            quantity: ''
          }
          this.creatorOpen = false
        } catch {
          // Something went wrong!
        } finally {
          this.newIngredientLoading = false
        }
      }
    },
    getIngredients () {
      this.ingredients = this.value
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang="stylus">
.ingredientsInput
  text-align left
  margin 20px 10px
  max-width 800px
  h1
    font-size 18px
  ul
    list-style-type none
    padding 0
  &__divider
    width 100%
    margin 15px 0
    height 2px
    background-color rgba(0, 0, 0, .08)
  &__close-button
    position absolute
    padding 0
    border none
    background transparent
    color #999
    font-weight bold
    font-size 18px
    margin 0
    cursor pointer
    transition-duration .2s
    &--right-top
      right 20px
      top 20px
    &--right-middle
      right 20px
      top calc(50% - 9px)
    &:hover
      opacity .8
    &:active
      opacity .5
  &__ingredient
    position relative
    display flex
    align-items center
    justify-content flex-start
    padding 10px 0
    width 100%
    margin 5px 0
    line-height 1.4em
    h1
      font-size 18px
      color #333
      font-weight 800
    h2
      color #999
      margin-top 4px
      font-size 16px
    &--button
      cursor pointer
      width 100%
      font inherit
      padding 3px 0px
      border none
      margin 0
      background white
      transition-duration .2s
      h1
        font-size 14px
        white-space nowrap
  &__image
    width 28px
    height 28px
    display flex
    align-items center
    justify-content center
    font-size 28px
    margin-right 10px
    color #999
    &:hover
        opacity .8
    &:active
      opacity .5
    &--empty
      background-color rgba(0, 0, 0, .05)
  &__creator
    position relative
    display flex
    height 300px
    align-items center
    justify-content space-between
    color #333
    padding 12px 0
    margin-bottom 15px
    width 100%
    ul
      max-height 200px
      border-radius 2px
      overflow-y scroll
    li
      border-bottom 2px solid rgba(0, 0, 0, .085)
      &:last-of-type
        border-bottom none
    h2
      flex-grow 1
      text-align center
    section
      height 100%
      &:first-of-type
        margin-right 25px
        flex-grow 2
      &:last-of-type
        flex-grow 1
        margin-left 25px
  &__blue-button
    border none
    width 70px
    border-radius 2px
    color white
    font inherit
    font-weight bold
    margin 10px 0
    background-color dodgerblue
    padding 5px 16px
    box-shadow 0 0 6px rgba(0, 0, 0, .13)
    cursor pointer
  &__banner
    padding 18px 24px
    text-align center
    background rgba(0, 0, 0, .025)
    h1
      margin 0
      font-size 16px
      color #999
    p
      margin 2px 0
      color #888
    i
      font-size 44px
      margin 10px 0 5px 0
      color #aaa
</style>
