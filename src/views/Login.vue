<template>
  <div class="login__redirect">
    {{ message }}
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

export default {
  name: 'Login',
  data () {
    return {
      message: "You're being redirected..."
    }
  },
  mounted () {
    httpClient
      .post(
        '/auth/login',
        {
          login_token: this.$route.params.code
        },
        {
          withCredentials: true
        }
      )
      .then((response) => {
        this.$store.commit('setUserData', response.data)
        this.$store.commit('login')
        this.$router.replace('/')
        location.reload()
      })
      .catch((e) => {
        this.message = 'Wrong login token'
      })
  }
}
</script>

<style lang="stylus">
.login__redirect {
  padding: 30px;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
