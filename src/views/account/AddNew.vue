<template>
  <div class="new">
    <div
      v-for="(group, index) in buttonGroups"
      :key="index">
      <h3>{{ group.name }}</h3>
      <div class="items">
        <div
          v-for="(button, index) in group.buttons"
          :key="index"
          class="items__item">
          <router-link :to="button.to">
            <div>
              <i :class="button.icon" />
              <br>
              {{ button.name }}
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddNew',
  data () {
    return {
      buttonGroups: [
        {
          name: 'Add a venue',
          buttons: [
            {
              name: 'Restaurant',
              to: '/account/new/restaurant',
              icon: 'fal fa-utensils-alt'
            },
            { name: 'Hotel', to: '/account/new/hotel', icon: 'fal fa-hotel' },
            { name: 'Cafe', to: '/account/new/cafe', icon: 'fal fa-coffee' },
            {
              name: 'Shop',
              to: '/account/new/shop',
              icon: 'fal fa-shopping-cart'
            }
          ]
        },
        {
          name: 'Add new product',
          buttons: [
            {
              name: 'Packaged food',
              to: '/account/new/packagedfood',
              icon: 'fal fa-shopping-basket'
            },
            {
              name: 'Fresh food',
              to: '/account/new/freshfood',
              icon: 'fal fa-apple-crate'
            },
            {
              name: 'Fashion',
              to: '/account/new/fashion',
              icon: 'fal fa-tshirt'
            },
            {
              name: 'Cosmetics',
              to: '/account/new/cosmetics',
              icon: 'fal fa-shower'
            },
            {
              name: 'Homeware',
              to: '/account/new/homeware',
              icon: 'fal fa-couch'
            }
          ]
        },
        {
          name: 'Add products for sale',
          buttons: [
            { name: 'Room', to: '/account/new/room', icon: 'fal fa-bed' },
            {
              name: 'Offer',
              to: '/account/new/offer',
              icon: 'fal fa-badge-dollar'
            },
            {
              name: 'Dish',
              to: '/account/new/dish',
              icon: 'fal fa-concierge-bell'
            },
            {
              name: 'Product offering',
              to: '/account/new/productoffering',
              icon: 'fal fa-shopping-cart'
            },
            {
              name: 'Service',
              to: '/account/new/service',
              icon: 'fal fa-user-tie'
            }
          ]
        },
        {
          name: 'Create media items',
          buttons: [
            {
              name: 'Article',
              to: '/account/new/article',
              icon: 'fal fa-newspaper'
            },
            {
              name: 'Post',
              to: '/account/new/post',
              icon: 'fal fa-chart-network'
            },
            {
              name: 'Recipe',
              to: '/account/new/recipe',
              icon: 'fal fa-gingerbread-man'
            },
            {
              name: 'Job ad',
              to: '/account/new/jobad',
              icon: 'fal fa-briefcase'
            }
          ]
        },
        {
          name: 'Promote your business',
          buttons: [
            {
              name: 'Create Organisation',
              to: '/account/new/organisation',
              icon: 'fal fa-building'
            }
          ]
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
.new
  max-width 850px
  height 100%
  margin auto
.items
  display flex
  flex-wrap wrap
  &__item
    text-align center
    vertical-align middle
    width 150px
    height auto
    margin 20px
    div
      padding 20% 0
      &:hover
        background-color #fcfcfc
        transform scale(1.03)
      i
        font-size 30px
        color #ccc
        margin 20px
</style>
