<template>
  <div
    v-if="id || !editMode"
    class="collectionForm"
  >
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear" />
    <modal-box
      ref="successModal"
      title="Done!"
      icon="smile-wink"
      @onConfirm="$router.push({ name: 'account-collection-edit', params: { name: formData.name } })" />
    <div
      v-if="editMode"
      class="collectionForm__editInfo"
    >
      Editing
    </div>

    <section>
      <div class="collectionForm__inputWrapper">
        <h3>Name (slug)</h3>
        <input
          type="text"
          v-model.lazy="formData.name"
          class="collectionForm__input"
        />
      </div>

      <div class="collectionForm__inputWrapper">
        <h3>Title</h3>
        <input
          type="text"
          v-model.lazy="formData.title"
          class="collectionForm__input"
        />
      </div>

      <div class="collectionForm__inputWrapper">
        <h3>Description</h3>
        <textarea
          v-model.lazy="formData.description"
          class="collectionForm__input collectionForm__input--wide"
        />
      </div>

      <div class="collectionForm__inputWrapper">
        <h3>Body</h3>
        <textarea
          v-model.lazy="formData.body"
          class="collectionForm__input collectionForm__input--wide"
        />
      </div>
    </section>

    <section>
      <div class="collectionForm__inputWrapper">
        <h3>Photos</h3>
        <PhotoUploader
          ref="photoUploader"
          v-model="formData.pictures"
        />
      </div>
    </section>

    <footer>
      <WhiteButton @click.native="editMode ? edit() : add()">
        {{ editMode ? 'Save changes' : 'Save new collection' }}
      </WhiteButton>
    </footer>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'
import WhiteButton from '@/components/account/atoms/WhiteButton.vue'
import PhotoUploader from '@/components/PhotoUploader.vue'

export default {
  name: 'CollectionList',
  components: {
    WhiteButton,
    PhotoUploader
  },
  props: {
    editMode: Boolean
  },
  data () {
    return {
      formData: {
        name: '',
        title: '',
        description: '',
        body: '',
        pictures: [],
        owner: ''
      },
      id: null
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
  created () {
    if (this.editMode) {
      this.getCollection()
    }
  },
  methods: {
    getCollection () {
      httpClient
        .get(`/item-collection/${this.$route.params.name}`)
        .then((response) => {
          this.collection = response.data
          this.formData = {
            name: response.data.name,
            title: response.data.title,
            description: response.data.description,
            body: response.data.body,
            owner: response.data.owner,
            pictures: response.data.pictures
          }
          this.id = response.data.id
          this.$nextTick(() => {
            this.$refs.photoUploader.restorePictures(response.data.pictures)
          })
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          console.log(error)
        })
    },
    edit () {
      httpClient
        .put(`/item-collection/${this.id}`, this.formData)
        .then(() => {
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          console.log(error)
        })
    },
    add () {
      httpClient
        .post('/item-collections', {
          ...this.formData,
          type: 'manual',
          owner: this.orgId || this.userId
        })
        .then(() => {
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
.collectionForm
  display block
  margin 0 auto
  max-width 1000px
  padding 0 30px 30px 30px
  background white
  box-shadow 0 0 14px rgba(0, 0, 0, .04)

  section
    padding-bottom 30px
    margin 0 auto
    max-width 640px
    h3
      padding 15px 0
    span
      margin 0 8px

  &__editInfo
    width 100%
    border-bottom 1px solid red
    border-top 1px solid transparent
    color red
    text-align center
    padding 1rem 0

  &__inputWrapper
    display inline-block
    width 100%

  &__input
    position relative
    border none
    background #fff
    min-width 300px
    margin 10px 0
    border 2px solid rgba(0,0,0,.08)
    height 42px
    padding-left 10px
    display flex
    font inherit
    transition border-color 0.2s
    &:focus
      border-color dodgerblue
    &:disabled
      color #777
    &--narrow
      display inline-block
      min-width 130px
    &--wide
      min-width 620px

  textarea
    min-height 150px
    padding 10px

  &__loading
    font-size 2rem
    padding: 3rem 0
    text-align center

  footer
    height 40px
    display flex
    align-items center
    justify-content space-around
</style>
