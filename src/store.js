import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    collectionNames: [],
    userLoggedIn: false,
    userLoginAction: null,
    userData: {},
    orgData: {},
    orgsAddedDuringSession: 0,
    CSRFtoken: null,
    cart: [],
    cartId: null,
    userAddressId: '',
    cartUpdated: 0,
    freeShipping: {
      canFreeShip: false,
      shippingItem: {}
    }
  },
  mutations: {
    setCollectionNames (state, payload) {
      if (state.collectionNames !== payload) {
        state.collectionNames = payload
      }
    },
    login (state) {
      state.userLoggedIn = true
    },
    logout (state) {
      state.userLoggedIn = false
      // clean up
      state.userData = {}
      state.cartId = null
      state.cart = []
    },
    setCSRFtoken (state, payload) {
      state.CSRFtoken = payload
    },
    setUserAddressId (state, payload) {
      state.userAddressId = payload
    },
    setUserData (state, payload) {
      state.userData = payload
    },
    setOrgData (state, payload) {
      state.orgData = payload
    },
    addOrg (state) {
      state.orgsAddedDuringSession += 1
    },
    updateCart (state, payload) {
      state.cart = payload
    },
    updateCartId (state, payload) {
      state.cartId = payload
    },
    cartUpdated (state) {
      state.cartUpdated++
    },
    updateFreeShipping (state, payload) {
      state.freeShipping = payload
    },
    updateUserLoginAction (state, payload) {
      state.userLoginAction = payload
    }
  },
  actions: {},
  getters: {
    isUserLoggedIn (state) {
      return state.userLoggedIn
    },
    getUserData (state) {
      return state.userData
    }
  }
})
