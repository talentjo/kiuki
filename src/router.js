import Vue from 'vue'
import Router from 'vue-router'

// Account components
import AccountHome from '@/views/account/Home'
import ItemApproval from '@/components/account/ItemApproval'
import AdminItemClaims from '@/components/account/AdminItemClaims'
import AddNew from '@/views/account/AddNew'
import ItemClaims from '@/components/account/ItemClaims'
import Organisations from '@/views/account/Organisations'
import CollectionList from '@/components/account/CollectionList'
import CollectionForm from '@/components/account/CollectionForm'
import AddressesList from '@/components/account/AddressesList'
import Bookings from '@/views/account/Bookings'
import Orders from '@/views/account/Orders'
import ItemForm from '@/components/account/ItemForm'
import Messages from '@/views/account/Messages'
import About from '@/views/account/About'
import Settings from '@/views/account/Settings'
import ItemList from '@/components/account/ItemList'

import menuCategories from '@/menuCategories.js'
import Account from './views/Account.vue'
import RecipePage from './views/RecipePage.vue'
import MagazinePage from './views/MagazinePage.vue'
import Magazine from './views/Magazine.vue'
import Recipe from './views/Recipe.vue'
import Login from './views/Login.vue'
import ItemPage from './views/ProductPage.vue'
import RestaurantPage from './views/RestaurantPage.vue'
import Home from './views/Home.vue'
import Restaurants from './views/Restaurants.vue'
import OrgPage from './views/OrgPage.vue'

Vue.use(Router)

const categories = Object.entries(menuCategories.categories).map(
  ([key, value]) => value.link
)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login/:code',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/restaurants',
      name: 'restaurants',
      component: Restaurants
    },
    {
      path: '/magazine',
      name: 'magazine',
      component: Magazine
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: Recipe
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      children: [
        {
          path: '',
          name: 'account-home',
          component: AccountHome
        },
        {
          path: 'messages',
          name: 'messages',
          component: Messages
        },
        {
          path: 'orders',
          name: 'orders',
          component: Orders
        },
        {
          path: 'order/:id',
          component: Orders,
          props: {
            individualOrder: true
          }
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: Bookings
        },
        {
          path: 'booking/:id',
          component: Bookings,
          props: {
            individualBooking: true
          }
        },
        {
          path: 'about',
          name: 'about',
          component: About
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        },
        {
          path: 'items/:itemsToLoad',
          component: ItemList
        },
        {
          path: 'collections',
          component: CollectionList
        },
        {
          path: 'my-addresses',
          component: AddressesList
        },
        {
          path: 'my-addresses/edit/:id',
          name: 'edit-existing-address',
          component: AddressesList
        },
        {
          path: 'my-addresses/new',
          name: 'create-new-address',
          component: AddressesList
        },
        {
          path: 'item-approval',
          component: ItemApproval
        },
        {
          path: 'item-claims',
          component: ItemClaims
        },
        {
          path: 'admin-item-claims',
          component: AdminItemClaims
        },
        {
          path: 'organisations',
          component: Organisations,
          name: 'organisations'
        },
        {
          path: 'new',
          name: 'addNew',
          component: AddNew
        },
        {
          path: 'new/restaurant',
          component: ItemForm,
          props: {
            itemType: 'restaurant',
            itemCategory: 'venue'
          }
        },
        {
          path: 'new/hotel',
          component: ItemForm,
          props: {
            itemType: 'hotel',
            itemCategory: 'venue'
          }
        },
        {
          path: 'new/cafe',
          component: ItemForm,
          props: {
            itemType: 'cafe',
            itemCategory: 'venue'
          }
        },
        {
          path: 'new/shop',
          component: ItemForm,
          props: {
            itemType: 'shop',
            itemCategory: 'venue'
          }
        },
        {
          path: 'new/packagedfood',
          component: ItemForm,
          props: {
            itemType: 'packagedfood',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/freshfood',
          component: ItemForm,
          props: {
            itemType: 'freshfood',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/fashion',
          component: ItemForm,
          props: {
            itemType: 'fashion',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/cosmetics',
          component: ItemForm,
          props: {
            itemType: 'cosmetics',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/homeware',
          component: ItemForm,
          props: {
            itemType: 'homeware',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/product',
          component: ItemForm,
          props: {
            itemType: 'product',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/room',
          component: ItemForm,
          props: {
            itemType: 'room',
            itemCategory: 'room'
          }
        },
        {
          path: 'new/offer',
          component: ItemForm,
          props: {
            itemType: 'offer',
            itemCategory: 'offer'
          }
        },
        {
          path: 'new/post',
          component: ItemForm,
          props: {
            itemType: 'post',
            itemCategory: 'media'
          }
        },
        {
          path: 'new/article',
          component: ItemForm,
          props: {
            itemType: 'article',
            itemCategory: 'media'
          }
        },
        {
          path: 'new/recipe',
          component: ItemForm,
          props: {
            itemType: 'recipe',
            itemCategory: 'media'
          }
        },
        {
          path: 'new/dish',
          component: ItemForm,
          props: {
            itemType: 'dish',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/jobad',
          component: ItemForm,
          props: {
            itemType: 'jobad',
            itemCategory: 'media'
          }
        },
        {
          path: 'new/organisation',
          component: ItemForm,
          props: {
            itemType: 'org',
            itemCategory: 'org'
          }
        },
        {
          path: 'new/service',
          component: ItemForm,
          props: {
            itemType: 'service',
            itemCategory: 'service'
          }
        },
        {
          path: 'new/productoffering',
          component: ItemForm,
          props: {
            itemType: 'productoffering',
            itemCategory: 'product'
          }
        },
        {
          path: 'new/collection',
          component: CollectionForm,
          name: 'account-collection-new',
          props: {
            editMode: false
          }
        },
        {
          path: 'edit/restaurant/:id',
          component: ItemForm,
          props: {
            itemType: 'restaurant',
            itemCategory: 'venue',
            editMode: true
          }
        },
        {
          path: 'edit/hotel/:id',
          component: ItemForm,
          props: {
            itemType: 'hotel',
            itemCategory: 'venue',
            editMode: true
          }
        },
        {
          path: 'edit/cafe/:id',
          component: ItemForm,
          props: {
            itemType: 'cafe',
            itemCategory: 'venue',
            editMode: true
          }
        },
        {
          path: 'edit/shop/:id',
          component: ItemForm,
          props: {
            itemType: 'shop',
            itemCategory: 'venue',
            editMode: true
          }
        },
        {
          path: 'edit/packagedfood/:id',
          component: ItemForm,
          props: {
            itemType: 'packagedfood',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/freshfood/:id',
          component: ItemForm,
          props: {
            itemType: 'freshfood',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/fashion/:id',
          component: ItemForm,
          props: {
            itemType: 'fashion',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/cosmetics/:id',
          component: ItemForm,
          props: {
            itemType: 'cosmetics',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/homeware/:id',
          component: ItemForm,
          props: {
            itemType: 'homeware',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/organisation/:id',
          component: ItemForm,
          props: {
            itemType: 'org',
            itemCategory: 'org',
            editMode: true
          }
        },
        {
          path: 'edit/product/:id',
          component: ItemForm,
          props: {
            itemType: 'product',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/room/:id',
          component: ItemForm,
          props: {
            itemType: 'room',
            itemCategory: 'room',
            editMode: true
          }
        },
        {
          path: 'edit/offer/:id',
          component: ItemForm,
          props: {
            itemType: 'offer',
            itemCategory: 'offer',
            editMode: true
          }
        },
        {
          path: 'edit/post/:id',
          component: ItemForm,
          props: {
            itemType: 'post',
            itemCategory: 'media',
            editMode: true
          }
        },
        {
          path: 'edit/article/:id',
          component: ItemForm,
          props: {
            itemType: 'article',
            itemCategory: 'media',
            editMode: true
          }
        },
        {
          path: 'edit/recipe/:id',
          component: ItemForm,
          props: {
            itemType: 'recipe',
            itemCategory: 'media',
            editMode: true
          }
        },
        {
          path: 'edit/dish/:id',
          component: ItemForm,
          props: {
            itemType: 'dish',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/jobad/:id',
          component: ItemForm,
          props: {
            itemType: 'jobad',
            itemCategory: 'media',
            editMode: true
          }
        },
        {
          path: 'edit/experience/:id',
          component: ItemForm,
          props: {
            itemType: 'experience',
            itemCategory: 'experience',
            editMode: true
          }
        },
        {
          path: 'edit/service/:id',
          component: ItemForm,
          props: {
            itemType: 'service',
            itemCategory: 'experience',
            editMode: true
          }
        },
        {
          path: 'edit/productoffering/:id',
          component: ItemForm,
          props: {
            itemType: 'productoffering',
            itemCategory: 'product',
            editMode: true
          }
        },
        {
          path: 'edit/collection/:name',
          component: CollectionForm,
          name: 'account-collection-edit',
          props: {
            editMode: true
          }
        }
      ]
    },
    {
      path: `/:categoryName(${categories.join('|')})`,
      name: 'categoryPage',
      component: Home
    },
    {
      path: '/search/:query?',
      name: 'searchPage',
      component: Home
    },
    {
      path: '/:slug',
      name: 'itemPage',
      component: ItemPage
    },
    {
      path: '/tag/:tag',
      name: 'tagPage',
      component: Home
    },
    {
      path: '/recipe/:slug',
      name: 'recipePage',
      component: RecipePage
    },
    {
      path: '/mag/:slug',
      name: 'magazinePage',
      component: MagazinePage
    },
    {
      path: '/restaurant/:slug',
      name: 'restaurantPage',
      component: RestaurantPage
    },
    {
      path: '/brand/:slug',
      name: 'orgPage',
      component: OrgPage
    }
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})

router.afterEach((to) => {
  window.analytics.page(to.name, {}, {
    integrations: {
      'All': true,
      'Algolia': false
    }
  })
})

export default router
