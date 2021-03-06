import Vue from 'vue'

Vue.directive('select-click-outside', {
  bind: function (el, binding) {
    binding.event = function (event) {
      if (
        !(
          el === event.target ||
          el.contains(event.target) ||
          event.target.classList.contains('select-item')
        )
      ) {
        if (binding.value instanceof Function) {
          binding.value(event)
        }
      }
    }
    document.body.addEventListener('click', binding.event)
  },
  unbind: function (el, binding) {
    document.body.removeEventListener('click', binding.event)
  }
})
