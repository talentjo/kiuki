<template>
  <div class="certificationInput">
    <template v-if="loading">
      <i
        class="fal fa-spinner"
        style="font-size: 20px; text-align: center; width: 100%;" />
    </template>
    <ul>
      <template v-if="selectedCertifications.length > 0 && !loading">
        <li
          v-for="(certification, index) in selectedCertifications"
          :key="`certification_${index}`"
          class="certificationInput__certification">
          <button
            v-test="{
              id: `selectedCertification_${index}`,
            }"
            class="
              certificationInput__close-button
              certificationInput__close-button--right-middle
            "
            @click="selectedCertifications.splice(index, 1)">
            <i class="fal fa-trash-alt" />
          </button>
          <v-lazy-image
            v-if="certificationList[certification].logo"
            class="certificationInput__image"
            :src="certificationList[certification].logo"
            width="50"
            height="50" />
          <div
            v-else
            class="certificationInput__image certificationInput__image--empty">
            <i class="fal fa-image" />
          </div>
          <span>
            <h1>{{ certificationList[certification].name }}</h1>
            <h2>{{ certificationList[certification].website }}</h2>
          </span>
        </li>
      </template>
      <template v-else-if="!loading">
        <div class="certificationInput__certification">
          <div class="certificationInput__image">
            <i class="fal fa-award" />
          </div>
          <span>
            <h1>Does your product have any certifications?</h1>
            <h2>Show 'em! Choose them from the list or add new ones.</h2>
          </span>
        </div>
      </template>
      <div class="certificationInput__divider" />
      <div
        v-if="creatorOpen"
        v-test="{ id: 'creator' }"
        class="certificationInput__creator">
        <section>
          <h3>Choose certification</h3>
          <ul v-if="unselectedCertifications.length > 0">
            <li
              v-for="(certification, index) in unselectedCertifications"
              :key="`certification_${index}`">
              <button
                v-test="{
                  id: `unselectedCertification_${index}`,
                }"
                class="certificationInput__certification certificationInput__certification--button"
                @click="selectCertification(certification)">
                <v-lazy-image
                  v-if="certificationList[certification].logo"
                  class="certificationInput__image"
                  :src="certificationList[certification].logo"
                  width="50"
                  height="50" />
                <div
                  v-else
                  class="certificationInput__image certificationInput__image--empty">
                  <i class="fal fa-image" />
                </div>
                <span>
                  <h1>{{ certificationList[certification].name }}</h1>
                </span>
              </button>
            </li>
          </ul>
          <div
            v-else
            class="certificationInput__banner">
            <h1>Bad luck!</h1>
            <i class="fal fa-grin-beam-sweat" />
            <div>
              <p>No more certifications in our database yet!</p>
              <p>Could you help us adding some?</p>
            </div>
          </div>
        </section>
        <h2>OR</h2>
        <section>
          <h3>Add a new one</h3>
          <TextInput
            v-model="newCertification.name"
            placeholder="Certification name" />
          <TextInput
            v-model="newCertification.logo"
            placeholder="Logo URL address" />
          <TextInput
            v-model="newCertification.website"
            placeholder="Certifier website URL" />
          <button
            class="certificationInput__blue-button"
            @click="addNewCertification(newCertification)">
            <i
              v-if="newCertificationLoading"
              class="fal fa-spinner-third fa-spin" />
            <span v-else>
              Add
            </span>
          </button>
          {" "}
          <span
            style="cursor: pointer;"
            @click="creatorOpen = false">
            Cancel
          </span>
        </section>
      </div>
      <button
        v-if="!creatorOpen"
        v-test="{ id: 'addCertificationButton' }"
        class="
          certificationInput__certification
          certificationInput__certification--button
        "
        @click="creatorOpen = true">
        <div class="certificationInput__image">
          <i class="fal fa-plus-square" />
        </div>
        <span>
          <h1>Add certification</h1>
        </span>
      </button>
    </ul>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import VLazyImage from 'v-lazy-image'
import TextInput from '@/components/account/inputs/TextInput.vue'
// import Test from '@/directives/test.js'

export default {
  name: 'CertificationInput',
  components: {
    VLazyImage,
    TextInput
  },
  directives: {
    // Test
  },
  props: {
    value: {
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      certificationList: {},
      loading: false,
      selectedCertifications: [],
      newCertification: {
        name: '',
        logo: '',
        website: ''
      },
      newCertificationLoading: false,
      creatorOpen: false
    }
  },
  computed: {
    unselectedCertifications () {
      return Object.keys(this.certificationList).filter(
        (cert) => !this.selectedCertifications.includes(cert)
      )
    }
  },
  created () {
    this.getCertificationList().then((r) => {
      this.selectedCertifications = this.value
    })
  },
  methods: {
    async getCertificationList () {
      this.loading = true
      try {
        const { data } = await httpClient.get('category/product-certification')
        this.certificationList = data
      } catch (error) {
        // Couldn't get certification list
        console.error(error)
      }
      this.loading = false
    },
    selectCertification (certification) {
      this.selectedCertifications.push(certification)
      this.$emit('input', this.selectedCertifications)
    },
    async addNewCertification (certification) {
      try {
        this.newCertificationLoading = true
        const label = certification.name.toLowerCase().replace(/ /g, '-')
        await httpClient.put(
          `category/product-certification/${label}`,
          certification
        )
        await this.getCertificationList()
        this.selectedCertifications.push(label)
        this.newCertification = {
          name: '',
          logo: '',
          website: ''
        }
        this.creatorOpen = false
      } catch {
        // Something went wrong!
      } finally {
        this.newCertificationLoading = false
      }
    }
  }
}
</script>

<style scoped lang="stylus">
.certificationInput
  text-align left
  margin 20px 0
  max-width 800px
  h1
    font-size 18px
  ul
    list-style-type none
    padding 0
  &__divider
    width 100%
    margin 15px 0
    height 2px
    background-color rgba(0, 0, 0, .08)
  &__close-button
    position absolute
    padding 0
    border none
    color #999
    background transparent
    font-weight bold
    font-size 18px
    margin 0
    cursor pointer
    transition-duration .2s
    &--right-top
      right 20px
      top 20px
    &--right-middle
      right 20px
      top calc(50% - 9px)
    &:hover
      opacity .8
    &:active
      opacity .5
  &__certification
    position relative
    display flex
    align-items center
    justify-content flex-start
    padding 10px 0
    width 100%
    margin 5px 0
    line-height 1.4em
    h1
      font-size 18px
      color #333
      font-weight 800
    h2
      color #999
      margin-top 4px
      font-size 16px
    &--button
      cursor pointer
      width 100%
      font inherit
      padding 3px 0px
      border none
      margin 0
      background white
      transition-duration .2s
      h1
        font-size 14px
        white-space nowrap
      .certificationInput__image
        width 28px
        height 28px
        margin-right 10px
      &:hover
        opacity .8
      &:active
        opacity .5
  &__image
    width 50px
    height 50px
    margin-right 15px
    display flex
    align-items center
    justify-content center
    font-size 28px
    color #999
    &--empty
      background-color rgba(0, 0, 0, .05)
  &__creator
    position relative
    display flex
    height 300px
    align-items center
    justify-content space-between
    color #333
    padding 12px 0
    margin-bottom 15px
    width 100%
    ul
      max-height 200px
      border-radius 2px
      overflow-y scroll
    li
      border-bottom 2px solid rgba(0, 0, 0, .085)
      &:last-of-type
        border-bottom none
    h2
      flex-grow 1
      text-align center
    section
      height 100%
      &:first-of-type
        margin-right 25px
        flex-grow 2
      &:last-of-type
        flex-grow 1
        margin-left 25px
  &__blue-button
    border none
    width 70px
    border-radius 2px
    color white
    font inherit
    font-weight bold
    background-color dodgerblue
    padding 5px 16px
    box-shadow 0 0 6px rgba(0, 0, 0, .13)
    cursor pointer
  &__banner
    padding 18px 24px
    text-align center
    background rgba(0, 0, 0, .025)
    h1
      margin 0
      font-size 16px
      color #999
    p
      margin 2px 0
      color #888
    i
      font-size 44px
      margin 10px 0 5px 0
      color #aaa
</style>
