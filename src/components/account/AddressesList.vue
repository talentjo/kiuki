<template>
  <div class="page-container">
    <h4>My Addresses</h4>
    <UserAddresses
      no-title
      list-only />
  </div>
</template>

<script>
import UserAddresses from '@/components/SideBar/UserPage/UserAddresses.vue'

export default {
  name: 'AddressList',
  components: {
    UserAddresses
  }
}
</script>

<style scoped lang="stylus">
.page-container {
  max-width: 1000px;
  margin: 20px auto 100px auto;
  padding: 0 20px;
}
</style>
