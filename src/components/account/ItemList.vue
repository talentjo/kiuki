<template>
  <div class="itemList">
    <modal-box
      ref="deleteModal"
      title="Should I delete this item?"
      icon="question"
      type="confirm"
      @onConfirm="deleteItem()" />
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear" />
    <modal-box
      ref="successModal"
      title="Done!"
      icon="smile-wink" />
    <modal-box
      ref="addToCollectionModal"
      title="Add selected items to a collection"
      type="no-footer"
      @onConfirm="$refs.addToCollectionModal.show = false">
      <SelectInput
        v-model="selectedCollectionId"
        :options="userCollections"
        :full-width="true" />
      <button
        class="showMore"
        :disabled="noMoreOptionsToLoad"
        @click="
          showMoreOptions++
          getUserCollections()
        ">
        Load more collections
      </button>
      <br>
      <WhiteButton @click.native="addItemsToColection">
        Add
      </WhiteButton>
    </modal-box>
    <template v-if="!isOrgPage">
      <p>You must be an organisation to access this page</p>
    </template>
    <template v-else>
      <ItemTable
        ref="itemTable"
        :items="items"
        :loading="loading"
        @handleDelete="handleDelete"
        @updateSelectedItems="updateSelectedItems">
        <WhiteButton
          style="
            margin-right: 15px;
            font-size: 14px;
            color: black;
            padding: 0 15px;
          "
          :disabled="selectedItems.length === 0"
          @click.native.stop="$refs.addToCollectionModal.show = true">
          Add selected items to collection...
        </WhiteButton>
        <DropdownButton
          size="small"
          style="margin-right: 15px">
          <p>Filter item types...</p>
          <template v-slot:content>
            <template v-for="input in itemTypes">
              <input
                :key="`input_${input}`"
                v-model="itemTypesToShow"
                type="checkbox"
                :value="input">{{ input }}<br :key="`br_${input}`">
            </template>
          </template>
        </DropdownButton>
        <TextInput
          v-model="searchInput"
          placeholder="Search item"
          @input="debounceSearch" />
      </ItemTable>
      <WhiteButton
        style="margin-right: 12px"
        :disabled="loading || page === 1"
        @click.native="
          page--
          loading = true
          getItems('')
        ">
        Previous Page
      </WhiteButton>
      <WhiteButton
        :disabled="loading || items.length < 48"
        @click.native="
          page++
          loading = true
          getItems('')
        ">
        Next Page
      </WhiteButton>
    </template>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'
import DropdownButton from '@/components/account/atoms/DropdownButton.vue'
import SelectInput from '@/components/account/inputs/SelectInput.vue'
import ItemTable from '@/components/account/ItemTable.vue'
import TextInput from '@/components/account/inputs/TextInput.vue'
import { setTimeout } from 'timers'
import { debounce } from 'debounce'

export default {
  name: 'ItemList',
  components: {
    WhiteButton,
    SelectInput,
    ItemTable,
    TextInput,
    DropdownButton
  },
  data () {
    return {
      items: [],
      itemTypes: [
        'restaurant',
        'hotel',
        'cafe',
        'shop',
        'packagedfood',
        'freshfood',
        'fashion',
        'cosmetics',
        'homeware',
        'product',
        'room',
        'article',
        'post',
        'recipe'
      ],
      itemTypesToShow: [],
      selectedItems: [],
      page: 1,
      showMoreOptions: 1,
      noMoreOptionsToLoad: false,
      userCollections: [],
      loading: false,
      selectedCollectionId: '',
      searchInput: '',
      deletedItem: {
        id: ''
      },
      cardsSize: 'big'
    }
  },
  computed: {
    userId () {
      return this.$store.state.userData ? this.$store.state.userData.id : null
    },
    orgId () {
      return this.$store.state.orgData ? this.$store.state.orgData.id : null
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
    }
  },
  watch: {
    userId (newUserId) {
      this.getItems('')
      this.getUserCollections()
    },
    orgId (newOrgId) {
      this.getItems('')
      this.getUserCollections()
    },
    itemTypesToShow () {
      this.getItems('')
    }
  },
  created () {
    if (this.userId) {
      this.getItems('')
      this.getUserCollections()
    }
  },
  methods: {
    debounceSearch: debounce(function () {
      this.getItems(this.searchInput)
    }, 500),
    getItems (query) {
      this.loading = true
      const getURL = this.orgId
        ? `/org/${this.orgId}/items?format=full&approval=pending,approved,rejected&per_page=48&page=${this.page}&q=${query}`
        : this.$store.state.userData.is_admin
          ? `/items?format=full&approval=pending,approved,rejected&per_page=48&page=${this.page}&q=${query}`
          : `/me/items?approval=pending,approved,rejected&per_page=48&page=${this.page}`
      httpClient
        .get(`${getURL}&type=${this.itemTypesToShow.join(',')}`)
        .then((response) => {
          this.items = response.data
        })
        .catch((error) => {
          this.items = []
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getUserCollections () {
      if (this.isAdmin) {
        httpClient
          .get(`/item-collections?per_page=20&page=${this.showMoreOptions}`)
          .then((response) => {
            if (response.data.length === 0) {
              this.noMoreOptionsToLoad = true
              return
            }
            response.data.forEach((collection) => {
              this.userCollections.push({
                name: collection.name,
                value: collection.name
              })
            })
          })
      } else {
        httpClient
          .get(
            `/item-collections?owner=${
              this.orgId || this.userId
            }&per_page=20&page=${this.showMoreOptions}`
          )
          .then((response) => {
            if (response.data.length === 0) {
              this.noMoreOptionsToLoad = true
              return
            }
            response.data.forEach((collection) => {
              this.userCollections.push({
                name: collection.name,
                value: collection.name
              })
            })
          })
      }
    },
    unselectItems () {
      this.$refs.itemTable.unselectItems()
    },
    handleDelete (itemId) {
      this.deletedItem = {
        id: itemId
      }
      this.$refs.deleteModal.show = true
    },
    addItemsToColection () {
      // This HAS TO BE be changed - https://github.com/veganbase/veganbase.com/issues/67
      this.selectedItems.forEach((item, index) => {
        setTimeout(() => {
          httpClient.put(
            `/item-collection/${this.selectedCollectionId}/item/${item.id}`
          )
        }, 400 * index)
      })
      this.$refs.addToCollectionModal.show = false
      setTimeout(() => {
        this.$refs.successModal.show = true
      }, this.selectedItems.length * 400)
      this.unselectItems()
      this.getItems('')
    },
    deleteItem () {
      httpClient
        .delete(`/item/${this.deletedItem.id}`)
        .then(() => {
          for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].id === this.deletedItem.id) {
              this.items.splice(i, 1)
            }
          }
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          console.log(error)
        })
    },
    updateSelectedItems (newItems) {
      this.selectedItems = newItems
    }
  }
}
</script>

<style scoped lang="stylus">
.itemList {
  display: flex;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 0 auto;
  text-align: left;
  gap: 10px;
}

button.showMore {
  cursor: pointer;
  text-align: left;
  width: 100%;
  display: block;
  border: none;
  background: transparent;
  padding: 0;

  &:disabled {
    cursor: not-allowed;
  }
}

.active {
  cursor: pointer;
}
</style>
