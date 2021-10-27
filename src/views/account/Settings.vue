<template>
  <div class="settings">
    <modal-box
      ref="memberModal"
      title="Add a new member"
      type="add"
      @onConfirm="addMember">
      <p>To add a new member, you need to know his e-mail id.</p>
      <TextInput
        v-model="newMemberEmail"
        placeholder="User E-Mail"
        :full-width="true" />
    </modal-box>
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear">
      User ID is invalid
    </modal-box>
    <modal-box
      ref="successModal"
      title="User added successfully!"
      icon="smile-wink"
      @onConfirm="$router.push('/account')" />
    <section>
      <template v-if="orgData">
        <h2>Organisation</h2>
        <table>
          <tr>
            <th colspan="2">
              Logo
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Employees</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
          <tr :key="`org_${orgData.id}`">
            <td
              class="avatar"
              colspan="2">
              <img
                class="avatar"
                :src="orgData.logo ? orgData.logo : null">
            </td>
            <td>{{ orgData.name }}</td>
            <td>
              {{
                orgData.contact_email ? orgData.contact_email : 'No email found'
              }}
            </td>
            <td>{{ orgData.employees }}</td>
            <td>
              {{
                orgData.description
                  ? orgData.description.substring(0, 20) + '...'
                  : 'No description found'
              }}
            </td>
            <td>
              <router-link :to="`/account/edit/organisation/${orgData.id}`">
                Edit
              </router-link>
            </td>
          </tr>
          <br>
          <tr>
            <th colspan="2">
              Members:
            </th>
            <th>
              <WhiteButton
                class="button"
                @click.native.stop="showMemberModal">
                Add member
              </WhiteButton>
            </th>
          </tr>
          <tr>
            <th colspan="2">
              Image
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
          <tr
            v-for="(member, index) in orgMembers"
            :key="`orgMember_${member.id}`">
            <td
              class="avatar"
              colspan="2">
              <img
                class="avatar"
                :src="member.image ? member.image : null">
            </td>
            <td>
              {{ member.name }}
            </td>
            <td>{{ member.email }}</td>
            <td v-if="member.user_is_admin">
              Admin
            </td>
            <td v-else>
              <a
                style="cursor: pointer"
                @click="removeMember(member.id, index)">Remove</a>
            </td>
          </tr>
        </table>

        <br><br>
      </template>
      <template v-else>
        <h2>User</h2>
        <table>
          <tr>
            <th colspan="2">
              Avatar
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Display Name</th>
            <th>Email</th>
            <th>Organisations</th>
            <th>Access</th>
          </tr>
          <tr>
            <td
              class="avatar"
              colspan="2">
              <img
                :key="currentUser.avatar"
                class="avatar"
                :src="currentUser.avatar ? currentUser.avatar : null">
            </td>
            <td>{{ currentUser.id }}</td>
            <td>{{ currentUser.name }}</td>
            <td>{{ currentUser.display_name }}</td>
            <td>{{ currentUser.email }}</td>
            <td>{{ currentUser.orgs ? currentUser.orgs.length : 0 }}</td>
            <td>{{ currentUser.is_admin ? 'Admin' : 'Normal' }}</td>
          </tr>
          <template v-if="currentUser.orgs && currentUser.orgs.length > 0">
            <tr>
              <th colspan="3">
                My Organisations:
              </th>
            </tr>
            <tr>
              <th colspan="2">
                Logo
              </th>
              <th>ID</th>
              <th>Slug</th>
              <th>Name</th>
              <th>Email</th>
              <th>Employees</th>
              <th>Manage</th>
            </tr>
            <tr
              v-for="(org, index) in currentUser.orgs"
              :key="index">
              <td
                class="avatar"
                colspan="2">
                <img
                  class="avatar"
                  :src="org.logo ? org.logo : null">
              </td>
              <td>{{ org.id }}</td>
              <td>{{ org.slug ? org.slug : null }}</td>
              <td>{{ org.name }}</td>
              <td>{{ org.contact_email ? org.contact_email : null }}</td>
              <td>{{ org.employees }}</td>
              <td>
                <a
                  style="cursor: pointer"
                  @click="manageOrg(org)">Manage</a>
              </td>
            </tr>
          </template>
        </table>

        <br>
      </template>
      <h2>Payments</h2>
      <p>
        In order to receive payments, you need to connect your ethical.id with a
        Stripe account.
      </p>
      <p v-if="stripeLoading">
        Please wait...
      </p>
      <p v-else-if="connectedToStripe">
        Account connected with Stripe!
        <br>
        <a @click="disconnectStripe()">Disconnect</a>
      </p>
      <p v-else-if="errorConnectingToStripe">
        Error connecting with Stripe. Error: {{ errorConnectingToStripe }}
      </p>
      <p v-else-if="this.$route.query.code">
        Connecting with Stripe...
      </p>
      <a
        v-else
        :href="
          `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripe_client_id}&scope=read_write`
        ">
        <img
          src="../../assets/stripe-button.png"
          height="25">
      </a>
    </section>
  </div>
</template>

<script>
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'
import httpClient from '@/services/httpClient'
import TextInput from '@/components/account/inputs/TextInput.vue'
import { ST_CLIENT_ID } from '@/config.js'

export default {
  name: 'Settings',
  components: {
    WhiteButton,
    TextInput
  },
  data () {
    return {
      orgMembers: [],
      newMemberEmail: '',
      stripe_client_id: ST_CLIENT_ID,
      connectedToStripe: false,
      errorConnectingToStripe: false,
      stripeLoading: true
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.orgData || this.$store.state.userData || null
    },
    orgData () {
      return this.$store.state.orgData || null
    }
  },
  watch: {
    orgData: {
      handler (orgData) {
        if (orgData) {
          this.getOrgMembers(orgData.id)
        }
      },
      immediate: true
    },
    currentUser: {
      handler (id) {
        this.checkStripeConnect()
      }
    }
  },
  created () {
    if (this.currentUser) {
      this.checkStripeConnect()
    }
  },
  methods: {
    getOrgMembers (orgId) {
      httpClient.get(`/org/${orgId}/users`).then((response) => {
        this.orgMembers = response.data
      })
    },
    showMemberModal () {
      this.$refs.memberModal.show = true
    },
    addMember () {
      httpClient
        .post(`/org/${this.orgData.id}/users`, {
          email: this.newMemberEmail,
          is_org_admin: true
        })
        .then((response) => {
          this.$refs.successModal.show = true
        })
        .catch((e) => {
          this.$refs.errorModal.show = true
        })
    },
    removeMember (userId, index) {
      httpClient
        .delete(`/org/${this.orgData.id}/user/${userId}`)
        .then((response) => {
          this.orgMembers.splice(index, 1)
        })
    },
    checkStripeConnect () {
      this.connectedToStripe = false
      this.errorConnectingToStripe = false
      this.stripeLoading = true
      // Check if user got redirected from Stripe Connect
      if (this.$route.query.code) {
        const { code } = this.$route.query
        // Get access_token
        const url = this.orgData
          ? `/org/${this.orgData.id}/payout-account`
          : '/me/payout-account'
        httpClient
          .post(url, { code })
          .then((response) => {
            this.connectedToStripe = true
          })
          .catch((error) => {
            this.errorConnectingToStripe = error.response.data.message
          })
          .finally(() => {
            this.stripeLoading = false
            this.$router.replace({ query: null, silent: true })
          })
      } else {
        const url = this.orgData
          ? `/org/${this.orgData.id}/payout-account`
          : '/me/payout-account'
        httpClient
          .get(url)
          .then((response) => {
            // Account found!
            this.connectedToStripe = true
          })
          .catch((error) => {
            // No connected account found
            console.log(error)
          })
          .finally(() => {
            this.stripeLoading = false
          })
      }
    },
    disconnectStripe () {
      const url = this.orgData
        ? `/org/${this.orgData.id}/payout-account`
        : '/me/payout-account'
      httpClient.delete(url).then((response) => {
        this.$router.go()
      })
    },
    manageOrg (payload) {
      this.$root.$emit('changeOrg', payload)
    }
  }
}
</script>

<style lang="stylus" scoped>
.settings
  display block
  height 100%
  a
    color red
    cursor pointer
  section
    text-align left
    margin 20px auto
    width 100%
    max-width 1100px
    padding 0 10px
    line-height 1.7em
    h3
      color #555
  &__orgMember
    margin 10px 0
    max-width 400px
    border 1px solid #eee
    padding 10px
    display flex
    align-items center
    justify-content space-between
  table
    width 100%
    th, td
      padding 5px 10px 5px 0
      margin auto
      text-align left
    tr:nth-child(n+1)
      border-top 1px solid #ddd
  .button
    background transparent !important
    border none !important
    cursor pointer !important
    text-decoration underline !important
    padding 0 !important
    box-shadow none !important
    min-width auto !important
    font-size inherit !important
  .avatar
    width 50px
    height 50px
    border-radius 50%
</style>
