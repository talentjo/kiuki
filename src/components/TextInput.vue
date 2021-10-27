<template>
  <ValidationProvider
    v-slot="{ errors }"
    mode="passive"
    :name="name"
    :rules="rules"
    slim>
    <div
      class="text-input"
      :class="{
        'text-input--disabled': disabled,
        'text-input--valid': !errors && !errors.length > 0,
        'text-input--not-valid': errors && errors.length > 0,
      }">
      <input
        :id="id"
        v-model="innerValue"
        type="text"
        :placeholder="placeholder"
        class="text-input__input"
        :name="name"
        :disabled="disabled">
      <img
        v-if="errors && errors.length > 0"
        :src="errors && errors.length > 0 ? CloseIcon : CheckIcon"
        alt="icon"
        class="text-input__icon"
        draggable="false">
    </div>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

import CheckIcon from '@/assets/check-mark.svg'
import CloseIcon from '@/assets/close.svg'

export default {
  name: 'TextInput',
  components: {
    ValidationProvider
  },
  props: {
    placeholder: String,
    value: String,
    rules: String,
    name: String,
    id: String,
    disabled: Boolean
  },
  data: () => ({
    CheckIcon,
    CloseIcon,
    innerValue: null
  }),
  watch: {
    innerValue (val) {
      this.$emit('input', val)
    },

    value (val) {
      this.innerValue = val
    }
  },
  mounted () {
    if (this.value) this.innerValue = this.value
  }
}
</script>

<style scoped lang="stylus">
.text-input {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;

  &--disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  &--valid {
    border-color: var(--color-green);
  }

  &--not-valid {
    border-color: var(--color-red);
  }

  &__input {
    width: 100%;
    margin-right: 10px;
    display: inline-block;
    background-color: white;
    color: black;
    padding: 7px;
    // min-width: 250px;
    font: inherit;
    font-size: 14px;
    transition-duration: 0.12s;
    border: none;

    &:hover {
      border-color: #ccc;
    }

    &:focus {
      border-color: dodgerblue;
    }

    &[disabled] {
      cursor: default;
      opacity: 0.3;
      background-color: #ddd;
    }
  }

  &__icon {
    height: 20px;
    width: auto;
  }
}
</style>
