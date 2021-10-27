<template>
  <div class="itemList">
    <modal-box
      ref="deleteModal"
      title="Are you sure you want to delete this claim?"
      icon="question"
      type="confirm"
      @onConfirm="deleteClaim()" />
    <modal-box
      ref="claimModal"
      :title="
        'Do you want to claim ownership of ' +
          (this.selectedItems.length > 1 ? 'these items?' : 'this item?')
      "
      icon="question"
      type="confirm"
      @onConfirm="submitClaim()" />
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear" />
    <modal-box
      ref="successModal"
      title="Done!"
      icon="smile-wink"
      @onConfirm="$router.go()" />
    <h1>Claim ownership</h1>
    <p>Are you a legal owner of a product/venue? Claim your ownership here!</p>
    <ItemSearch
      :selected-items="[...selectedItems, ...tableData]"
      @itemSelected="item => selectedItems.push(item)" />
    <div
      v-for="(selectedItem, index) in selectedItems"
      :key="`selectedItem_${selectedItem.id}`"
      class="itemList__claim">
      <h2>{{ selectedItem.name }}</h2>
      <p>{{ selectedItem.description }}</p>
      <a
        target="_blank"
        :href="
          `https://new.veganbase.com/${selectedItem.item_type}/${
            selectedItem.slug
          }`
        "><WhiteButton>See on Veganbase</WhiteButton></a>
      <WhiteButton
        style="margin-left: 20px"
        @click.native="selectedItems.splice(index, 1)">
        Remove
      </WhiteButton>
    </div>
    <button
      v-if="selectedItems.length > 0"
      class="itemList__button"
      @click.stop="$refs.claimModal.show = true">
      Claim Ownership
    </button>
    <vue-table
      title="Your claims"
      :columns="['Item name', 'Status', 'Actions']"
      :rows="['item_name', 'status']"
      :table-data="tableData">
      <template scope="{rowData}">
        <i
          class="fal fa-trash-alt active"
          style="cursor: pointer"
          title="Delete claim"
          @click.stop="handleDelete(rowData.id)" />
      </template>
    </vue-table>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import VueTable from '@/components/account/VueTable.vue'
import ItemSearch from '@/components/account/atoms/ItemSearch.vue'
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'

export default {
  name: 'AdminItemClaims',
  components: {
    VueTable,
    ItemSearch,
    WhiteButton
  },
  data () {
    return {
      tableData: [],
      deletedClaimId: '',
      selectedItems: [],
      deletedItem: {
        id: ''
      }
    }
  },
  computed: {
    userId () {
      return this.$store.state.userData ? this.$store.state.userData.id : null
    },
    orgId () {
      return this.$store.state.orgData ? this.$store.state.orgData.id : null
    }
  },
  watch: {
    userId (newUserId) {
      this.getItems()
    },
    orgId (newOrgId) {
      this.getItems()
    }
  },
  created () {
    this.getItems()
  },
  methods: {
    async getItems () {
      const response1 = await httpClient.get(
        `/ownership-claims?user=${this.orgId ||
          this.userId}&per_page=100&page=1`
      )
      const response2 = await httpClient.get(
        `/ownership-claims?user=${this.orgId ||
          this.userId}&per_page=100&page=2`
      )
      this.tableData = [...response1.data, ...response2.data]
    },
    submitClaim () {
      if (this.orgId) {
        for (const selectedItem of this.selectedItems) {
          httpClient
            .post(`/item/${selectedItem.id}/claim-ownership`, {
              org: this.orgId
            })
            .then((response) => {
              this.$refs.successModal.show = true
            })
            .catch((error) => {
              this.$refs.errorModal.show = true
              console.log(error)
            })
        }
      } else {
        for (const selectedItem of this.selectedItems) {
          httpClient
            .post(`/item/${selectedItem.id}/claim-ownership`)
            .then((response) => {
              this.$refs.successModal.show = true
            })
            .catch((error) => {
              this.$refs.errorModal.show = true
              console.log(error)
            })
        }
      }
    },
    handleDelete (id) {
      this.deletedClaimId = id
      this.$refs.deleteModal.show = true
    },
    deleteClaim () {
      httpClient
        .delete(`/ownership-claim/${this.deletedClaimId}`)
        .then((response) => {
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          console.log(error)
        })
    }
  }
}
</script>

<style scoped lang="stylus">
.itemList
  display block
  &__claim
    text-align left
    margin 40px auto 50px auto
    max-width 590px
  &__button
    margin 25px auto
    padding 12px 29px
    background white
    border 2px solid #ccc
    color black
    cursor pointer
    font-size 16px
    font-weight 600
    text-transform uppercase
    transition .12s
    &:hover
      opacity .7
</style>
