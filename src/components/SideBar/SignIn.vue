<template>
  <div class="signIn">
    <img
      class="logo"
      src=""
      width="150">
    <h2>Simple Sign In and Signup</h2>
    <p>Our simple sign in does not require you to signup or to use a password, we’ll send you a code which you can use to sign in.</p>
    <br><br>
    <label>
      Enter your email and we'll send you a code which you can use to sign in.
    </label>
    <div class="signIn__form">
      <input
        type="email"
        v-model.trim="email"
        style="text-transform: lowercase"
        placeholder="Email address"
        :disabled="success || loading"
        @keyup.enter="
          tryToSendAuthEmail()
          sendButtonClicked = true
        ">
      <button
        class="send"
        :class="success || loading ? 'disabled' : ''"
        @click.prevent="
          tryToSendAuthEmail()
          sendButtonClicked = true
        ">
        <span>Send code</span>
        <CheckIcon
          v-if="success"
          class="icon">
          >
        </CheckIcon>
        <LoaderIcon
          v-else-if="loading"
          class="icon">
          >
        </LoaderIcon>
        <ChevronIcon
          v-else
          class="icon">
          >
        </ChevronIcon>
      </button>
    </div>
    <button
      v-if="sendButtonClicked && success"
      style="border: none; cursor: pointer; background: transparent; padding: 0; font: inherit; color: #008fe4; font-size: 12px; margin-top: 5px"
      @click="
        email = ''
        sendButtonClicked = false
        success = false
        loading = false
        codeErrorMessage = ''
        codeError = false
      ">
      Use different email
    </button>
    <br>
    <br>
    <template v-if="success">
      <h1>Use 6 digit code</h1>
      <p>Check your email and use the code to sign in.</p>
      <CodeInput
        @success="handleSignedIn"
        @error="handleCodeError" />
    </template>
    <label
      v-if="codeError"
      class="error">
      {{ codeErrorMessage }}
    </label>
    <label
      v-if="sendButtonClicked && !emailIsValid()"
      class="error">
      Invalid e-mail address.
    </label>
  </div>
</template>

<script>
import CodeInput from '@/components/SideBar/CodeInput.vue'
import httpClient from '@/services/httpClient'
import Feather from 'feather-icons'
import { Check, Loader, ChevronRight } from 'vue-feather-icon'

export default {
  name: 'SignIn',
  components: {
    CodeInput,
    CheckIcon: Check.default,
    LoaderIcon: Loader.default,
    ChevronIcon: ChevronRight.default
  },
  data () {
    return {
      email: '',
      loading: false,
      success: false,
      sendButtonClicked: false,
      codeError: false,
      codeErrorMessage: ''
    }
  },
  mounted () {
    Feather.replace()
  },
  methods: {
    tryToSendAuthEmail () {
      if (this.emailIsValid() && !this.success && !this.loading) {
        this.sendAuthEmail()
      }
    },
    emailIsValid () {
      // eslint-disable-next-line no-useless-escape
      return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        this.email
      )
    },
    sendAuthEmail () {
      this.loading = true
      // Send the authentication email
      httpClient
        .post('auth/request-login-email', {
          language: 'en',
          email: this.email.toLowerCase()
        })
        .then((response) => {
          this.success = true
          this.$forceUpdate()
          Feather.replace()
        })
    },
    handleSignedIn (userData) {
      this.$emit('setUserData', userData)
      this.$emit('signedIn')

      window.analytics.identify(userData.id, {
        name: userData.name,
        email: userData.email.toLowerCase()
      }, {
        integrations: {
          'All': true,
          'Algolia': false
        }
      })
    },
    handleCodeError (message) {
      this.codeError = true
      this.codeErrorMessage = message
    }
  }
}
</script>

<style scoped lang="stylus">
.feather, svg
  stroke-width 1.3px
  stroke white

.logo
  margin 20px 0

.signIn
  width 100%
  height 100%
  text-transform none
  &__form
    margin-top 8px
    display flex
    align-items center
    height 46px
  h1
    margin 0
  input
    display inline-block
    border 1px solid #008fe4
    font inherit
    min-width 290px
    height 100%
    border-radius 7px
    border-top-right-radius 0
    border-bottom-right-radius 0
    padding 11px 14px
    box-sizing border-box
    margin 0
    background transparent
    transition all .2s
    width 100%
    &::placeholder
      color #555
    &:focus
      outline none
  label
    color #888
    font-size 12px
  label.error
    color #ff4433
  button.send
    display inline-flex
    align-items center
    font inherit
    white-space nowrap
    height 100%
    justify-content space-around
    margin 0
    background #008fe4
    color white
    padding 11px 14px 11px
    cursor pointer
    box-sizing border-box
    border none
    border-top-right-radius 7px
    border-bottom-right-radius 7px
    transition-duration .2s
    &:hover
      opacity .9
    &:focus
      outline none
    span
      margin-right 8px

  button.disabled
    cursor default
    &:hover
      opacity 1

@media screen and (max-width: 520px)
  .signIn
    input
      min-width 0
</style>
