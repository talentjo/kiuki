<template>
  <div class="bigBanner">
    <div v-if="showHeadBanner">
      <!-- <button class="bigBanner__closeButton" @click="closeBanner">
        <i class="fas fa-times-circle"></i>
      </button> -->
      <div
        v-if="collection"
        class="bigBanner__top"
      >
        <h1 v-if="collection.title">
          {{ collection.title }}
        </h1>
        <p
          v-if="collection.description"
          v-html="collection.description"
          class="more"
        />
      </div>
    </div>
    <div
      v-if="collection && collection.pictures && collection.pictures.length"
      class="bigBanner__photo"
    >
      <picture>
        <source
          media="(max-width: 499px)"
          :srcset="imgix(collection.pictures[0], {
            height: 300,
            width: 500,
            fit: 'crop'
          })"
        >
        <img
          :src="imgix(collection.pictures[0], {
            width: 1120,
          })"
        >
      </picture>
    </div>
    <div
      v-if="showUPS"
      class="bigBanner__bottom">
      <div class="ups-desktop">
        <div>
          <img src="/banner-icons/icons8-truck-96.png">
          <div class="desc">
            <span>Free next day delivery</span><span>On orders over £55</span>
          </div>
        </div>
        <div>
          <img src="/banner-icons/icons8-contactless-delivery-96.png">
          <div class="desc">
            <span>Delivered to your door</span><span>Carbon Neutral Delivery</span>
          </div>
        </div>
        <div>
          <img src="/banner-icons/icons8-winter-96.png">
          <div class="desc">
            <span>Frozen Delivery</span><span>Up to 36 Hours Frozen</span>
          </div>
        </div>
        <div>
          <img src="/banner-icons/icons8-recycle-96.png">
          <div class="desc">
            <span>Eco Packaging</span><span>Innovative recycled box</span>
          </div>
        </div>
      </div>
      <div class="ups-mobile">
        <tiny-slider
          v-bind="sliderOptions"
          autoplay
          :autoplay-button-output="false"
          :autoplay-timeout="3000"
          class="ups-slider">
          <div>
            <div>
              <img src="/banner-icons/icons8-truck-96.png">
              <div class="desc">
                <span>Free next day delivery</span><span>On orders over £55</span>
              </div>
            </div>
          </div>
          <div>
            <div>
              <img src="/banner-icons/icons8-contactless-delivery-96.png">
              <div class="desc">
                <span>Delivered to your door</span><span>Carbon Neutral Delivery</span>
              </div>
            </div>
          </div>
          <div>
            <div>
              <img src="/banner-icons/icons8-winter-96.png">
              <div class="desc">
                <span>Frozen Delivery</span><span>Up to 36 Hours Frozen</span>
              </div>
            </div>
          </div>
          <div>
            <div>
              <img src="/banner-icons/icons8-recycle-96.png">
              <div class="desc">
                <span>Eco Packaging</span><span>Innovative recycled box</span>
              </div>
            </div>
          </div>
        </tiny-slider>
      </div>
    </div>
  </div>
</template>

<script>
import VueTinySlider from 'vue-tiny-slider'
import 'tiny-slider/dist/tiny-slider.css'
import menuCategories from '@/menuCategories.js'
import imgix from '@/services/imgix'

export default {
  name: 'BigBanner',
  components: {
    'tiny-slider': VueTinySlider
  },
  props: {
    isProduct: {
      type: Boolean,
      default: false
    },
    collection: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      bannerClosed: false,
      sliderOptions: {
        mouseDrag: true,
        loop: true,
        items: 1,
        controls: false,
        nav: false,
        preventScrollOnTouch: 'auto',
        menuCategories
      },
      imgix
    }
  },
  computed: {
    showUPS () {
      if (this.isProduct) return true
      if (this.bannerClosed) return false
      if (this.$route.name === 'searchPage') return false

      const isClosed = localStorage.getItem('frozenlyBigBannerClosed')
      return !!(isClosed == null || isClosed === 'false')
    },
    showHeadBanner () {
      if (this.isProduct === true) return false
      if (this.collection) return true
      if (this.bannerClosed) return false

      const isClosed = localStorage.getItem('frozenlyBigBannerClosed')
      return !!(isClosed == null || isClosed === 'false')
    }
  },
  filters: {
    nl2br (text) {
      return text.replace(/(?:\r\n|\r|\n)/g, '<br />')
    }
  },
  methods: {
    closeBanner () {
      this.bannerClosed = true
      localStorage.setItem('frozenlyBigBannerClosed', true)
    }
  }
}
</script>

<style scoped lang="stylus">
.bigBanner {
  margin-bottom: 1.5rem;

  &__top {
    text-align: left;
    margin-bottom: 2rem;
    padding: 1rem 0.625rem 0 0.625rem;

    h1 {
      font-family: 'Patua One', cursive;
      font-weight: 400;
      font-size: 2rem;
      letter-spacing: .025em;
      margin: 1rem 0;

      @media screen and (min-width: 700px) {
        font-size: 2.75rem;
      }
    }

    .more {
      display: block;
      margin-top: 2rem;
      white-space: pre-wrap;

      /deep/ a {
        text-decoration: underline;
      }
    }
  }

  &__photo {
    @media screen and (max-width: 499px) {
      width: 100%;
      height: 60vw;

      img {
        position: absolute;
        left: 0;
        width: 100%;
      }
    }

    @media screen and (min-width: 500px) {
      padding: 0 .625rem 0 .625rem

      img {
        width: 100%;
        height: auto;
      }
    }
  }

  &__bottom {
    background-color: white;
    border-radius: 0 0 1rem 1rem;

    .ups-desktop {
      display: flex;
      justify-content: space-between;

      @media screen and (max-width: 832px) {
        flex-wrap: wrap;
      }

      & > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.875rem 0.4rem;

        @media screen and (max-width: 832px) {
          width: 50%;
          padding: 0.4rem 0.2rem;
        }

        img {
          height: 3.5rem;
          margin-right: 0.75rem;
        }

        .desc {
          display: grid;
          padding: 0.875rem 0;

          @media screen and (max-width: 832px) {
            min-width: 150px;
          }

          span {
            font-size: 0.7rem;
            text-align: left;
            white-space: nowrap;

            @media screen and (max-width: 1110px) {
              white-space: normal;
            }
          }

          span:nth-child(1) {
            font-weight: 520;
            font-size: 0.8rem;
            padding-bottom: 0.05rem;
            white-space: nowrap;
          }
        }
      }
    }

    .ups-mobile {
      display: none;

      .ups-slider > div > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.6rem 0.2rem;

        img {
          height: 2.5rem;
          margin-right: 0.75rem;
        }

        .desc {
          display: grid;
          padding: 0.875rem 0;

          span {
            font-size: 0.9rem;
            text-align: left;
          }

          span:nth-child(1) {
            font-weight: 520;
            font-size: 1rem;
            padding-bottom: 0.05rem;
            white-space: nowrap;
          }
        }
      }
    }
  }

  &__closeButton {
    background: transparent;
    padding: 0;
    border: none;
    font: inherit;
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #7C6332;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

@media (max-width: 499.98px) {
  .bigBanner__bottom {
    .ups-desktop {
      display: none;
    }

    .ups-mobile {
      display: block;
    }
  }
}
</style>
