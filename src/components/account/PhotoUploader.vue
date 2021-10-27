<template>
  <div class="photoUploader">
    <input
      type="file"
      multiple
      @change="filesChange($event.target.files)">
    <div
      ref="dropContainer"
      class="photoUploader__dropContainer">
      <p>Drop some photos here</p>
    </div>
    <div class="photoUploader__photos">
      <div
        v-for="(file, index) in files"
        :key="file.source + index"
        class="photoUploader__photo">
        <img
          v-img-orientation-changer
          width="300"
          height="300"
          :src="file.source">
        <div
          v-if="file.isLoading"
          class="photoUploader__spinner">
          <i class="fal fa-spinner-third fa-spin" />
        </div>
        <div
          v-else
          class="photoUploader__menu">
          <i
            v-if="index > 0"
            title="Move photo left"
            class="fal fa-arrow-left"
            @click="movePhotoLeft(index)" />
          <i
            title="Delete photo"
            class="fal fa-trash-alt"
            @click="deletePhoto(index)" />
          <i
            v-if="index > 0"
            title="Make photo main"
            class="fal fa-crown"
            @click="makePhotoMain(index)" />
          <i
            v-if="index < files.length - 1"
            title="Move photo right"
            class="fal fa-arrow-right"
            @click="movePhotoRight(index)" />
        </div>
        <div
          v-if="index === 0"
          class="photoUploader__crown">
          <i
            title="Main photo"
            class="fal fa-crown" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

export default {
  name: 'PhotoUploader',
  data () {
    return {
      files: []
    }
  },
  mounted () {
    [
      'drag',
      'dragstart',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
      'drop'
    ].forEach((evt) => {
      this.$refs.dropContainer.addEventListener(
        evt,
        (e) => {
          e.preventDefault()
          e.stopPropagation()
        },
        false
      )
    })

    this.$refs.dropContainer.addEventListener('drop', (e) => {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        this.files.push(e.dataTransfer.files[i])
        this.getImagePreviews()
      }
    })
  },
  methods: {
    restorePictures (pictures) {
      if (typeof pictures !== 'undefined') {
        for (const picture of pictures) {
          const id = picture
          this.files.push({
            source: picture,
            id,
            processed: true,
            isLoading: false
          })
        }
      }
      this.emitModel()
    },
    getImagePreviews () {
      for (let i = 0; i < this.files.length; i++) {
        if (/\.(jpe?g|png|webp)$/i.test(this.files[i].name)) {
          const reader = new FileReader()
          reader.addEventListener(
            'load',
            () => {
              this.files[i].source = reader.result
            },
            false
          )

          if (!this.files[i].processed) {
            this.files[i].processed = true
            this.files[i].isLoading = true
            reader.readAsDataURL(this.files[i])
            this.uploadPhoto(i)
          }
        }
      }
    },
    movePhotoLeft (photoIndex) {
      const i = photoIndex
      const tmp = this.files[i]
      this.files[i] = this.files[i - 1]
      this.files[i - 1] = tmp
      this.emitModel()
      this.$forceUpdate()
    },
    movePhotoRight (photoIndex) {
      const i = photoIndex
      const tmp = this.files[i]
      this.files[i] = this.files[i + 1]
      this.files[i + 1] = tmp
      this.emitModel()
      this.$forceUpdate()
    },
    makePhotoMain (photoIndex) {
      const i = photoIndex
      const tmp = this.files[i]
      this.files[i] = this.files[0]
      this.files[0] = tmp
      this.emitModel()
      this.$forceUpdate()
    },
    deletePhoto (photoIndex) {
      console.log('photoIndex:', photoIndex)
      this.files.splice(photoIndex, 1)
      this.emitModel()
    },
    filesChange (files) {
      [...files].map((file) => {
        this.files.push(file)
      })
      this.getImagePreviews()
    },
    uploadPhoto (fileIndex) {
      httpClient
        .post('/blobs', this.files[fileIndex])
        .then((response) => {
          this.files[fileIndex].id = response.data.uri
          this.files[fileIndex].isLoading = false
          this.emitModel()
          this.$forceUpdate()
        })
        .catch((e) => {
          console.error(e)
        })
    },
    emitModel () {
      const pictures = this.files.map((file) => file.id)
      this.$emit('input', pictures)
    }
  }
}
</script>

<style scoped lang="stylus">
.photoUploader
  display block
  &__dropContainer // Because dropbox was already taken
    margin 15px auto 40px auto
    width 500px
    height 190px
    padding 30px 80px
    border 1px dashed #ddd
    display flex
    flex-direction column
    align-items center
    justify-content center
    cursor default
  &__photos
    display grid
    grid-template 1fr / 1fr 1fr
    gap 15px
  &__photo
    position relative
    width 300px
    height 300px
    overflow hidden
    img
      height 300px
      position absolute
      top: 0
      object-fit cover
      left 0
    &--loading
      opacity .1
  &__menu
    position absolute
    display flex
    align-items center
    justify-content space-around
    bottom 0
    margin 0 auto
    padding 5px
    height 30px
    font-size 18px
    width 100%
    color black
    background rgba(255, 255, 255, .95)
    z-index 2
    i
      cursor pointer
  &__spinner
    position absolute
    width 40px
    font-size 40px
    height 40px
    top calc(50% - 20px)
    left calc(50% - 20px)
  &__crown
    width 40px
    height 40px
    padding 10px
    font-size 20px
    color black
    display flex
    align-items center
    justify-content center
    border-radius 50px
    background-color white
    position absolute
    left calc(50% - 20px)
    box-shadow 0 0 12px rgba(0, 0, 0, .2)
    top 6px
    margin 0 auto
    z-index 2
</style>
