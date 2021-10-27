import Vue from 'vue'
import Meta from 'vue-meta'
import VueJsonLD from 'vue-jsonld'

import ToggleButton from 'vue-js-toggle-button'
import VueImgOrientationChanger from 'vue-img-orientation-changer'
import VuePhoneNumberInput from 'vue-phone-number-input'
import VueCurrencyInput from 'vue-currency-input'
import ModalBox from '@/components/account/global/ModalBox.vue'
import VueCookies from 'vue-cookies'
import VeeValidate, { Validator } from 'vee-validate'
import { ReactiveRefs } from 'vue-reactive-refs'
import router from './router'
import store from './store'
import App from './App.vue'
import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import InstantSearch from 'vue-instantsearch'
import VueObserveVisibility from 'vue-observe-visibility'

import 'vue-phone-number-input/dist/vue-phone-number-input.css'
import './assets/styles/main.css'
import '@/directives/directive.js'
import 'instantsearch.css/themes/satellite-min.css'

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    Vue: Vue,
    dsn: 'https://c7636a7bf3d44c79a9b1a42cc89e91af@o879386.ingest.sentry.io/5832027',
    integrations: [new Integrations.BrowserTracing()],
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0
  })
}

Vue.use(Meta)
Vue.use(VueJsonLD)
Vue.use(VueImgOrientationChanger)
Vue.use(VueCookies)
Vue.use(VueCurrencyInput)
Vue.use(ToggleButton)
Vue.use(ReactiveRefs)
Vue.$cookies.config('30d')

Vue.component('modal-box', ModalBox)
Vue.component('vue-phone-number-input', VuePhoneNumberInput)

Vue.use(VeeValidate, {
  useConstraintAttrs: false
})

Vue.use(InstantSearch)
Vue.use(VueObserveVisibility)

Validator.extend('contact_phone', (value) => /^\\+(?:[0-9] ?){6,14}[0-9]$/.test(value))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
