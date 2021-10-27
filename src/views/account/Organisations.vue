<template>
  <div class="organisations">
    <section v-if="organisations.length > 0">
      <h3>List of organisations</h3>
      <table>
        <tr
          v-for="(organisation, index) in organisations"
          :key="index">
          <td
            class="avatar"
            colspan="2">
            <img
              v-if="organisation.logo"
              class="avatar"
              :src="organisation.logo">
          </td>
          <td colspan="2">
            {{ organisation.name }}
          </td>
          <td>
            {{
              organisation.description
                ? trimmedDescription(organisation.description)
                : 'No description found'
            }}
          </td>
          <td v-if="Object.keys(organisation.address).length !== 0">
            {{
              organisation.address.street_address
                ? organisation.address.street_address
                : null
            }},
            {{ organisation.address.city ? organisation.address.city : null }},
            {{
              organisation.address.country ? organisation.address.city : null
            }},
            {{
              organisation.address.postcode ? organisation.address.city : null
            }}
          </td>
          <td v-else>
            No address found
          </td>
        </tr>
      </table>

      <WhiteButton
        style="margin-right: 12px"
        :disabled="loading || page === 1"
        @click.native="
          page--
          loading = true
          getOrganisations()
        ">
        Previous Page
      </WhiteButton>
      <WhiteButton
        :disabled="loading || organisations.length < 48"
        @click.native="
          page++
          loading = true
          getOrganisations()
        ">
        Next Page
      </WhiteButton>
    </section>
    <section v-else-if="!loading && organisations.length === 0">
      <h3>No organisations yet</h3>
    </section>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'
import { reject } from 'q'

export default {
  name: 'Organisations',
  components: {
    WhiteButton
  },
  data () {
    return {
      organisations: [],
      page: 1,
      loading: false
    }
  },
  created () {
    this.getOrganisations()
  },
  methods: {
    getOrganisations () {
      this.loading = true
      httpClient
        .get(`/orgs?per_page=48&page=${this.page}`)
        .then((response) => {
          this.organisations = response.data
        })
        .catch((error) => {
          this.organisations = []
          reject(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    trimmedDescription (description) {
      if (description.length > 40) {
        return `${description.slice(0, 40)}...`
      }
      return description
    }
  }
}
</script>

<style lang="stylus" scoped>
.organisations
  display block
  height 100%
  section
    text-align left
    margin 20px auto
    width 100%
    max-width 1100px
    padding 0 10px
    line-height 1.7em
    h3
      color #555
    table
      width 100%
      th, td
        padding 10px 10px 10px 0
        margin auto
        text-align left
      tr:nth-child(n+1)
        border-top 1px solid #ddd
    .avatar
      width 50px
      height 50px
      object-fit contain
    .links
      text-decoration underline
</style>
