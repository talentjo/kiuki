<template>
  <div class="itemList">
    <modal-box
      ref="deleteModal"
      title="Should I delete this collection?"
      icon="question"
      type="confirm"
      @onConfirm="deleteCollection()" />
    <modal-box
      ref="removeModal"
      title="Should I remove this item from this collection?"
      icon="question"
      type="confirm"
      @onConfirm="removeItem()" />
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear">
      {{ errorMessage }}
    </modal-box>
    <modal-box
      ref="successModal"
      title="Done!"
      icon="smile-wink"
      @onConfirm="$router.go()" />
    <modal-box
      ref="createCollectionModal"
      title="Create a new collection"
      type="no-footer"
      @onConfirm="$refs.createCollectionModal.show = false">
      <TextInput
        v-model.trim="newCollectionName"
        :full-width="true"
        placeholder="Collection name" />
      <WhiteButton @click.native="handleCreateCollection">
        Create
      </WhiteButton>
    </modal-box>
    <template v-if="!isOrgPage">
      <p>You must be an organisation to access this page</p>
    </template>
    <template v-else-if="!selectedCollection">
      <h2>Your collections:</h2>
      <p>
        You can group your items in Collections in order to be displayed on the
        website.
        <br>
        Soon you will have filters and smart Collections that will aggregate
        items for you.
      </p>
      <router-link :to="{ name: 'account-collection-new' }">
        <WhiteButton>
          Create new collection
        </WhiteButton>
      </router-link>
      <ul>
        <li
          v-for="collectionName in collectionNames"
          :key="collectionName">
          <a @click="getCollection(collectionName)">
            <i class="fal fa-box" />
            {{ collectionName }}
            <router-link
              :to="{ name: 'account-collection-edit', params: { name: collectionName } }"
              title="Edit"
              class="edit"
            >
              <i class="fal fa-pen" />
            </router-link>
          </a>
          <p>{{ collections.ids }}</p>
        </li>
      </ul>
      <WhiteButton
        style="margin-right: 12px"
        :disabled="loading || page === 1"
        @click.native="
          page--
          loading = true
          getItemCollections()
        ">
        Previous Page
      </WhiteButton>
      <WhiteButton
        :disabled="loading || collectionNames.length < 48"
        @click.native="
          page++
          loading = true
          getItemCollections()
        ">
        Next Page
      </WhiteButton>
    </template>
    <template v-else>
      <WhiteButton
        @click.native="selectedCollection = null">
        Go back
      </WhiteButton>
      <ItemTable
        :items="selectedCollection.items"
        :name="selectedCollection.name"
        :show-remove-button="true"
        @handleRemove="handleRemove">
        <p>
          All items:
          {{ selectedCollection.items ? selectedCollection.items.length : 0 }}
        </p>
        <WhiteButton
          style="margin-left: 15px"
          @click.native.stop="() => handleDelete(selectedCollection.name)">
          Delete collection
        </WhiteButton>
        <router-link
          :to="{ name: 'account-collection-edit', params: { name: selectedCollection.name } }"
          class="edit"
        >
          <WhiteButton>
            Edit collection
          </WhiteButton>
        </router-link>
      </ItemTable>
      <div class="pagination-container">
        <WhiteButton
          style="margin-right: 12px"
          :disabled="itemsPage === 1"
          @click.native="itemsPage--; getCollection(selectedCollection.name)">
          Previous Page
        </WhiteButton>
        <WhiteButton
          :disabled="selectedCollection.items.length < 30"
          @click.native="itemsPage++; getCollection(selectedCollection.name)">
          Next Page
        </WhiteButton>
      </div>
    </template>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'
import TextInput from '@/components/account/inputs/TextInput.vue'
import ItemTable from '@/components/account/ItemTable.vue'

export default {
  name: 'CollectionList',
  components: {
    WhiteButton,
    TextInput,
    ItemTable
  },
  data () {
    return {
      loading: true,
      collections: [],
      collectionNames: [],
      selectedCollection: null,
      errorMessage: '',
      removedItem: {
        tableName: '',
        id: ''
      },
      page: 1,
      itemsPage: 1,
      newCollectionName: ''
    }
  },
  computed: {
    userId () {
      return this.$store.state.userData ? this.$store.state.userData.id : null
    },
    isAdmin () {
      return this.$store.state.userData
        ? this.$store.state.userData.is_admin
        : null
    },
    isOrgPage () {
      const obj = this.$store.state.orgData
      if (typeof obj !== 'undefined' && obj !== null) {
        return !(Object.keys(obj).length === 0 && obj.constructor === Object)
      }
      return false
    },
    orgId () {
      return this.$store.state.orgData ? this.$store.state.orgData.id : null
    }
  },
  watch: {
    userId (newUserId) {
      this.getItemCollections()
    },
    orgId (newOrgId) {
      this.getItemCollections()
    }
  },
  created () {
    if (this.userId) {
      this.getItemCollections()
    }
  },
  methods: {
    getItemCollections () {
      this.collectionNames = []
      if (this.isAdmin) {
        httpClient
          .get(`/item-collections?per_page=48&page=${this.page}`)
          .then((response) => {
            this.collectionNames = []
            this.collectionNames = this.collectionNames.concat(
              response.data.map((collection) => collection.name)
            )
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        httpClient
          .get(
            `/${this.orgId ? 'org' : 'user'}/${this.orgId ||
              this.userId}/item-collections?per_page=48&page=${this.page}`
          )
          .then((response) => {
            this.collectionNames = []
            this.collectionNames = this.collectionNames.concat(
              response.data.map((collection) => collection.name)
            )
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    getCollection (collectionName) {
      httpClient
        .get(`/items?format=full&per_page=30&collections=${collectionName}&page=${this.itemsPage}`)
        .then((response) => {
          this.selectedCollection = response.data
          this.selectedCollection.items = []
          this.selectedCollection.name = collectionName
          this.selectedCollection.items.push(...response.data)
          this.$forceUpdate()
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          this.errorMessage = `${
            error.response.data.message
          }. If it's empty please go to My items and add some items to the collection.`
        })
    },
    getItems () {
      httpClient
        .get('/item-collections/list')
        .then((response) => {
          this.collections = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCreateCollection () {
      httpClient
        .post('/item-collections', {
          name: `${this.newCollectionName}`,
          type: 'manual',
          owner: this.orgId || this.userId
        })
        .then((response) => {
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          this.errorMessage = error.response.data.message
        })
        .finally(() => {
          this.$refs.createCollectionModal.show = false
        })
    },
    handleRemove (id) {
      this.removedItem = { tableName: this.selectedCollection.name, id }
      this.$refs.removeModal.show = true
    },
    handleDelete (tableName) {
      this.removedItem.tableName = tableName
      this.$refs.deleteModal.show = true
    },
    deleteCollection () {
      httpClient
        .delete(`/item-collection/${this.removedItem.tableName}`)
        .then((response) => {
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          console.error(error)
          this.$refs.errorModal.show = true
          this.errorMessage = error.response.data.message
        })
    },
    removeItem () {
      httpClient
        .delete(
          `/item-collection/${this.removedItem.tableName}/item/${
            this.removedItem.id
          }`
        )
        .then(() => {
          // delete item from list
          this.selectedCollection.items = this.selectedCollection.items.filter((item) => item.id !== this.removedItem.id)

          for (let i = this.collections.length - 1; i >= 0; i--) {
            if (this.collections[i].name === this.removedItem.tableName) {
              for (let j = this.collections[i].items.length - 1; j >= 0; j--) {
                if (this.collections[i].items[j].id === this.removedItem.id) {
                  this.collections[i].items.splice(j, 1)
                }
              }
            }
          }
          this.$forceUpdate()
          // this.$refs.successModal.show = true
        })
        .catch((error) => {
          console.error(error)
          this.$refs.errorModal.show = true
          this.errorMessage = error.response.data.message
        })
    }
  }
}
</script>

<style scoped lang="stylus">
.itemList
  display block
  text-align left
  padding 0 60px
  button
    margin-bottom 10px
  ul
    list-style-type none
    padding-left 4px
  a
    cursor pointer
    i
      margin-right 7px
      font-size 1.05em
  .edit
    margin-left 7px

.active
  cursor pointer

.pagination-container
  max-width 1100px
  margin 0 auto
</style>
