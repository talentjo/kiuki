<template>
  <div class="itemList">
    <modal-box
      ref="approveModal"
      title="Are you sure you want to approve this claim?"
      icon="question"
      type="confirm"
      @onConfirm="approveClaim()" />
    <modal-box
      ref="rejectModal"
      title="Are you sure you want to reject this claim?"
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
      :columns="['Owner name and email', 'Item name', 'Status', 'Actions']"
      :rows="['owner_name', 'item_name', 'status']"
      :table-data="tableData">
      <template scope="{rowData}">
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
      selectedClaimId: 0,
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
      httpClient.get('/ownership-claims').then((response) => {
        this.tableData = [...this.tableData, ...response.data]
        for (const [index, ownerId] of this.tableData
          .map((claim) => claim.owner_id)
          .entries()) {
          if (ownerId.includes('org')) {
            httpClient.get(`/org/${ownerId}`).then((response) => {
              this.tableData[index].owner_name = `${response.data.name} - ${response.data.email}`
              this.$forceUpdate()
            })
          } else {
            httpClient.get(`/user/${ownerId}`).then((response) => {
              this.tableData[index].owner_name = `${response.data.name} - ${response.data.email}`
              this.$forceUpdate()
            })
          }
        }
      })
    },
    handleApprove (id) {
      this.selectedClaimId = id
      this.$refs.approveModal.show = true
    },
    handleReject (id) {
      this.selectedClaimId = id
      this.$refs.rejectModal.show = true
    },
    approveClaim () {
      httpClient
        .post(`/ownership-claim/${this.selectedClaimId}/status`, {
          status: 'approved'
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
        .post(`/ownership-claim/${this.selectedClaimId}/status`, {
          status: 'rejected'
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
