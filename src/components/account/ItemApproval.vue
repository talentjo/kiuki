<template>
  <div class="itemList">
    <modal-box
      ref="approveModal"
      title="Are you sure you want to approve this item?"
      icon="question"
      type="confirm"
      @onConfirm="approveClaim()" />
    <modal-box
      ref="rejectModal"
      title="Are you sure you want to reject this item?"
      icon="question"
      type="confirm"
      @onConfirm="rejectClaim()" />
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear" />
    <modal-box
      ref="successModal"
      title="Done!"
      icon="smile-wink"
      @onConfirm="$router.go()" />
    <vue-table
      :title="$route.params.itemsToLoad"
      :columns="['Creator', 'Item name', 'Description', 'Actions']"
      :rows="['creator', 'name', 'description']"
      :table-data="tableData">
      <template scope="{rowData}">
        <i
          class="fal fa-edit active"
          @click="$router.replace(`/edit/${rowData.item_type}/${rowData.id}`)" />
        <i
          class="fal fa-check active"
          title="Approve claim"
          @click.stop="handleApprove(rowData.id)" />
        <i
          class="fal fa-times active"
          title="Reject claim"
          @click.stop="handleReject(rowData.id)" />
      </template>
    </vue-table>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import VueTable from '@/components/account/VueTable.vue'

export default {
  name: 'AdminItemClaims',
  components: {
    VueTable
  },
  props: {
    hidden: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      selectedApprovalId: 0,
      tableData: [],
      deletedItem: {
        id: ''
      }
    }
  },
  computed: {
    userId () {
      return this.$store.state.userData.id
    }
  },
  created () {
    this.getItems()
  },
  methods: {
    getItems () {
      httpClient.get('/items?approval=pending&format=full').then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          response.data[i].approval = 'pending'
          if (response.data[i].description.length > 130) {
            response.data[i].description = `${response.data[i].description.substring(0, 130)}...`
          }
        }
        this.tableData = [...this.tableData, ...response.data]
      })
    },
    handleApprove (id) {
      this.selectedApprovalId = id
      this.$refs.approveModal.show = true
    },
    handleReject (id) {
      this.selectedApprovalId = id
      this.$refs.rejectModal.show = true
    },
    approveClaim () {
      httpClient
        .post(`/item/${this.selectedApprovalId}/approval`, {
          approval: 'approved'
        })
        .then((response) => {
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          console.log(error)
        })
    },
    rejectClaim () {
      httpClient
        .post(`/item/${this.selectedApprovalId}/approval`, {
          approval: 'rejected'
        })
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

.active
  cursor pointer
</style>
