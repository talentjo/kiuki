<template>
  <div>
    <div class="productPage">
      <DetailedProductCard
        v-if="productData"
        :product-data="productData"
        @addProductToCart="$emit('addProductToCart', $event)"
        restaurant
      />
      <div
        v-if="productData"
        style="width: 100%; margin-top: 15px"
      >
        <div
          v-if="
            productData.item_type !== 'article' &&
              productData.item_type !== 'post'
          "
          class="productPage__tabs"
        >
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'About' }"
            @click="openTab = 'About'"
          >
            <span class="productPage__tab--label">About</span
            ><i class="productPage__tab--icon fal fa-info-circle" />
          </button>
          <button
            class="productPage__tab"
            :class="{
              'productPage__tab--active': openTab === 'Opening hours',
            }"
            @click="openTab = 'Opening hours'"
          >
            <span class="productPage__tab--label">Opening hours</span
            ><i class="productPage__tab--icon fal fa-clipboard-list" />
          </button>
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'Map' }"
            @click="openTab = 'Map'"
          >
            <span class="productPage__tab--label">Map</span
            ><i class="productPage__tab--icon fal fa-carrot" />
          </button>
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'Reviews' }"
            @click="openTab = 'Reviews'"
          >
            <span class="productPage__tab--label"
              >Reviews ({{ reviews.length }})</span
            ><i class="productPage__tab--icon fal fa-comments" />
          </button>
          <button
            class="productPage__tab"
            :class="{ 'productPage__tab--active': openTab === 'Contact' }"
            @click="openTab = 'Contact'"
          >
            <span class="productPage__tab--label">Contact</span
            ><i class="productPage__tab--icon fal fa-carrot" />
          </button>
        </div>
        <div
          v-if="
            productData.item_type !== 'article' &&
              productData.item_type !== 'post'
          "
          class="productPage__openTab"
        >
          <template v-if="openTab === 'About'">
            <div v-if="productData.content">
              <vue-markdown
                :class="`${readMore ? 'content content--full' : 'content'}`"
              >
                {{ productData.content }}
              </vue-markdown>
            </div>
            <p v-else class="content">No data.</p>
          </template>
          <template v-else-if="openTab === 'Opening hours'">
            <div class="content" v-if="productData.item_type === 'restaurant'">
              <table class="opening-table">
                <tbody>
                  <tr>
                    <th>
                      <p>Day</p>
                    </th>
                    <th>
                      <p>Hours</p>
                    </th>
                  </tr>
                  <template
                    v-if="
                      productData.opening_hours &&
                        productData.opening_hours[0].periods
                    "
                  >
                    <tr
                      v-for="day in productData.opening_hours[0].periods"
                      :key="day.day"
                    >
                      <td>{{ weekDays[day.day] }}</td>
                      <td v-if="day.start !== day.end">
                        <span>{{
                          `${formatClock(day.start)} - ${formatClock(day.end)}`
                        }}</span>
                        <span v-if="day.is_overnight"> (Overnight)</span>
                      </td>
                      <td v-else>Open 24h</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
          <template v-else-if="openTab === 'Map'">
            <div class="content">
              <p
                v-text="
                  `${productData.address.street_address}, ${productData.address.city}, ${productData.address.country}`
                "
              />
              <a
                :href="
                  `https://www.google.com/maps?q=${productData.address}%20${productData.name}`
                "
                target="_blank"
                v-text="'Open in Google Maps'"
                style="margin-bottom: 20px; display: block"
              />
              <GoogleMap :geolocation="productData.location" />
            </div>
          </template>
          <template v-else-if="openTab === 'Reviews'">
            <div class="productPage__writeReview">
              <h2>Write a review</h2>
              <div
                v-if="$store.getters.isUserLoggedIn && editorMode"
                class="editorMode"
              >
                <div class="editorMode--editor">
                  Rank this product from 1 to 10: &nbsp;
                  <RankInput v-model="newReview.rank" />
                  <textarea
                    v-model="newReview.content"
                    placeholder="Please enter your review here"
                  />
                </div>
                <div>
                  <PhotoUploader v-model="newReview['pictures']" />
                </div>
                <div>
                  <button
                    class="productPage__writeReview__add"
                    :disabled="newReview.content === ''"
                    @click="addReview()"
                  >
                    <span v-if="!loading">Submit</span
                    ><i v-else class="fal fa-spinner" />
                  </button>
                  <button
                    class="productPage__writeReview__cancel"
                    @click="cancelReview()"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <button
                v-else-if="!editorMode && $store.getters.isUserLoggedIn"
                class="productPage__writeReview--editorButton"
                @click="editorMode = true"
              >
                <i class="fal fa-plus">&nbsp;</i><span>Add review</span>
              </button>
              <p v-else>
                Please
                <button class="signIn" @click.stop="$emit('openMagicSidebar')">
                  sign in</button
                >to continue.
              </p>
            </div>
            <h3 style="text-align: left">
              Reviews({{ reviews.length }}):
              <div
                v-for="(review, index) in reviews"
                :key="index"
                class="productPage__reviews"
              >
                <div>
                  <div class="productPage__reviews--heading--title">
                    <img
                      class="productPage__reviews--heading--avatar"
                      :src="review.owner.image"
                    />
                    <h4>{{ review.owner.name }} &nbsp;</h4>
                  </div>
                  <p>Rating: {{ review.rank }}<i class="fas fa-star" /></p>
                  <p
                    :class="`${readMore ? 'content content--full' : 'content'}`"
                  >
                    {{ review.content }}
                  </p>
                  <!-- <span
                    v-if="readMore !== true"
                    class="readMore"
                    @click="readMore = true"
                    >Read More</span
                  > -->
                </div>
                <img
                  v-if="review.pictures[0]"
                  class="productPage__reviews--heading--image"
                  :src="review.pictures[0]"
                />
              </div>
            </h3>
          </template>
          <template v-else-if="openTab === 'Contact'">
            <div class="content contact-tab">
              <div
                v-if="
                  typeof productData.urls !== 'undefined' &&
                    productData.urls.website
                "
              >
                <i class="fal fa-globe" />
                <span>
                  <a
                    :href="productData.urls.website"
                    v-text="productData.urls.website"
                  />
                </span>
              </div>
              <div
                v-if="
                  typeof productData.contact_phone !== 'undefined' &&
                    productData.contact_phone
                "
              >
                <br />
                <i class="fal fa-phone" />
                <span v-text="productData.contact_phone" />
              </div>
              <div
                v-if="
                  typeof productData.contact_email !== 'undefined' &&
                    productData.contact_email
                "
              >
                <br />
                <i class="fal fa-envelope" />
                <span v-text="productData.contact_email" />
              </div>
              <div class="item__socialIcons">
                <template
                  v-if="
                    typeof productData.urls !== 'undefined' &&
                      productData.urls.facebook
                  "
                >
                  <a :href="productData.urls.facebook" target="_blank">
                    <i class="fab fa-facebook-square" />
                  </a>
                </template>
                <template
                  v-if="
                    typeof productData.urls !== 'undefined' &&
                      productData.urls.instagram
                  "
                >
                  <a :href="productData.urls.instagram" target="_blank">
                    <i class="fab fa-instagram" />
                  </a>
                </template>
                <template
                  v-if="
                    typeof productData.urls !== 'undefined' &&
                      productData.urls.twitter
                  "
                >
                  <a :href="productData.urls.twitter" target="_blank">
                    <i class="fab fa-twitter" />
                  </a>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <RelatedProducts
      v-if="productData"
      :product="productData"
      :id="productData.id"
      :tags="productData.tags"
      @addProductToCart="$emit('addProductToCart', $event)"
    />
  </div>
</template>

<script>
import httpClient from '@/services/httpClient'

import DetailedProductCard from '@/components/DetailedProductCard.vue'
import VueMarkdown from 'vue-markdown'
import PhotoUploader from '@/components/PhotoUploader.vue'
import RankInput from '@/components/RankInput.vue'
// import IngredientsDisplay from '@/components/IngredientsDisplay.vue'
import { reject } from 'q'
import RelatedProducts from '@/components/RelatedProducts.vue'
import { getMetaTags, getJsonLd } from '@/seo.js'
import format from 'date-fns/format'
import GoogleMap from '@/components/account/GoogleMap.vue'

export default {
  components: {
    RankInput,
    DetailedProductCard,
    VueMarkdown,
    PhotoUploader,
    RelatedProducts,
    GoogleMap
  },
  data () {
    return {
      loading: false,
      editorMode: false,
      productLoaded: false,
      productData: null,
      openTab: 'Map',
      reviews: [],
      newReview: {
        post_type: 'review',
        pictures: [],
        content: '',
        rank: 1
      },
      readMore: false,
      weekDays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
    }
  },
  computed: {
    slug () {
      return this.$route.params.slug
    }
  },
  created () {
    httpClient
      .get(`/item/${this.slug}`)
      .then((response) => {
        this.productData = response.data
        this.productLoaded = true
        this.getOfferings()
        this.getReviews()
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    formatDate (date) {
      return format(new Date(date), 'dd MMMM yyyy')
    },
    formatClock (clock) {
      if (!clock) return ''
      console.log(clock)
      clock = clock.toString()
      return `${clock.slice(0, 2)}:${clock.slice(2)}`
    },
    getOfferings () {
      this.productData.offerings = []
      httpClient
        .get(
          `/item/${this.productData.id}/links?page=1&per_page=100&link_format=full`
        )
        .then((response) => {
          for (const link of response.data) {
            if (link.link_type === 'product-has-offerings') {
              httpClient.get(`/item/${link.target}`).then((response2) => {
                this.productData.offerings.push(response2.data)
                this.productData = { ...this.productData } // To make the state refresh
              })
            }
          }
        })
    },
    getReviews () {
      httpClient
        .get(
          `/item/${this.productData.id}/posts?format=full&type=review&sort_by=desc(rank)`
        )
        .then((response) => {
          this.reviews = response.data
        })
    },
    cancelReview () {
      this.newReview = {}
      this.editorMode = false
    },
    addReview () {
      this.loading = true
      this.newReview.rank = parseInt(this.newReview.rank, 10)
      httpClient
        .post(`/item/${this.productData.id}/post`, this.newReview)
        .then((response) => {
          this.loading = false
          this.editorMode = false
          this.getReviews()
        })
        .catch((error) => {
          this.editorMode = false
          this.loading = false
          alert('Oops! Something went wrong, please try again.')
          reject(error)
        })
    }
  },
  metaInfo () {
    if (!this.productData) return
    const seo = {
      metaTitle: this.productData.name,
      metaDescription: this.productData.description,
      shareImage: this.productData.featured_picture,
      url: this.productData.slug
    }
    const jsonld = {
      name: this.productData.name,
      description: this.productData.description,
      type: 'Restaurant',
      servesCuisine: 'Vegan',
      geo: {
        '@type': 'GeoCoordinates',
        'latitude': this.productData.location.latitude,
        'longitude': this.productData.location.longitude
      },
      address: {
        '@type': 'PostalAddress',
        'streetAddress': this.productData.address.street_address,
        'addressLocality': this.productData.address.city,
        'postalCode': this.productData.address.postcode,
        'addressCountry': this.productData.address.country
      },
      telephone: this.productData.contact_phone,
      email: this.productData.contact_email,
      url: this.productData.urls.website || this.productData.urls.facebook,
      image: this.productData.pictures,
      keywords: this.productData.tags,
      review:
        this.reviews &&
        this.reviews.map((review) => {
          return {
            '@type': 'Review',
            author: review.owner.name,
            datePublished: this.formatDate(review.created_at),
            reviewBody: review.content,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rank,
              bestRating: 10,
              worstRating: 1
            }
          }
        })
    }
    return {
      title: this.productData.name
        ? `${this.productData.name} - Mighty Plants`
        : 'Mighty Plants - Discover and Order the best new foods',
      meta: getMetaTags(seo),
      script: [
        {
          type: 'application/ld+json',
          json: getJsonLd(jsonld)
        }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
h2 {
  font-weight: normal;
}

h3 {
  font-weight: normal;
}

h4 {
  font-weight: normal;
}

.signIn {
  text-decoration: underline;
  background: transparent;
  border: none;
  cursor: pointer;
}

.productPage {
  margin: 0 auto;
  background-color: white;
  border-radius: 3rem;
  padding: 3rem;
  min-height: 30rem;

  &__tabs {
    width: 100%;
    border-top: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0;
    margin-bottom: 15px;
  }

  &__tab {
    width: auto;
    padding: 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
    font: inherit;
    font-size: 14px;
    color: black;
    border: none;
    background-color: white;
    justify-content: center;
    cursor: pointer;

    &--icon {
      display: none;
    }

    &--active {
      border-bottom: 1px solid #222;

      p {
        color: black;
        height: 100%;
        display: block;
      }
    }
  }

  &__openTab {
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;
  }

  &__writeReview {
    font-size: 14px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;

    input {
      position: relative;
      border: none;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      padding: 10px;
      margin-bottom: 20px;
      font: inherit;
      transition: border-color 0.3s;

      &:focus {
        border-color: dodgerblue;
      }
    }

    textarea {
      width: 100%;
      min-height: 100px;
      position: relative;
      border: none;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      padding: 10px;
      margin-bottom: 10px;
      font: inherit;
      transition: border-color 0.3s;

      &:focus {
        border-color: dodgerblue;
      }
    }

    &--editorButton {
      border: none;
      width: auto;
      border-radius: 2px;
      color: white;
      font: inherit;
      background-color: black;
      padding: 5px 16px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.13);
      cursor: pointer;
      margin: 10px 0;

      &[disabled] {
        opacity: 0.4;
        cursor: default;

        &:hover {
          opacity: 0.4;
        }
      }
    }

    &__add {
      border: none;
      width: auto;
      border-radius: 2px;
      color: white;
      font: inherit;
      background-color: dodgerblue;
      padding: 5px 16px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.13);
      cursor: pointer;
      margin: 10px 0;

      &[disabled] {
        opacity: 0.4;
        cursor: default;

        &:hover {
          opacity: 0.4;
        }
      }
    }

    &__cancel {
      border: none;
      width: auto;
      color: black;
      text-decoration: underline;
      font: inherit;
      background: transparent;
      padding: 5px 16px;
      cursor: pointer;
      margin: 10px;

      &[disabled] {
        opacity: 0.4;
        cursor: default;

        &:hover {
          opacity: 0.4;
        }
      }
    }
  }

  &__reviews {
    display: grid;
    font-size: 14px;
    height: auto;
    max-width: 100%;
    grid-template: auto / auto 300px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
    padding: 20px 0;

    i {
      color: #ffd700;
      margin: 11px 5px;
    }

    &--heading {
      display: flex;

      &--title {
        display: flex;
        flex-direction: row;

        h3 {
          width: 100%;
          margin: 10px 0;
        }

        h4 {
          margin: 10px 0;
        }
      }

      &--image {
        position: relative;
        vertical-align: middle;
        width: auto;
        max-height: 150px;
        float: left;
      }

      &--avatar {
        position: relative;
        vertical-align: middle;
        height: 50px;
        border-radius: 50%;
        width: 50px;
        margin-right: 10px;
      }
    }
  }
}

.editorMode {
  display: flex;
  font-size: 14px;
  flex-direction: row;
  flex-wrap: wrap;

  &--editor {
    min-width: 60%;
  }

  div {
    margin: 0 20px;
    margin-left: 0;
  }
}

.content {
  font-size: 14px;
  text-align: left;
  font-size: 14px;
  // max-height: 200px;
  width: 100%;
  overflow-y: auto;

  &--full {
    max-height: 100%;
  }
}

.readMore {
  font-size: 14px;
  float: left;
  color: dodgerblue;
  cursor: pointer;
}

.row {
  font-size: 14px;
  display: grid;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  gap: 30px;
  grid-template: 1fr / 1fr 1fr 1fr 1fr;
  padding-bottom: 30px;
}

@media screen and (max-width: 955px) {
  .row {
    grid-template: 1fr / 1fr 1fr 1fr;
  }
}

@media screen and (max-width: 780px) {
  .row {
    grid-template: 1fr / 1fr 1fr;
    max-width: 460px;
  }

  .productPage {
    &__reviews {
      grid-template: auto / auto;

      &--heading {
        &__image {
          max-height: 150px;
          max-width: 100%;
        }

        &--title {
          flex-direction: column;
        }
      }
    }
  }

  .editorMode {
    flex-direction: column;

    div {
      margin: 0;
    }
  }
}

@media screen and (max-width: 550px) {
  .row {
    gap: 10px;
  }

  .productPage {
    padding: 1.5rem;
    border-radius: 1.5rem;

    &__tab {
      &--label {
        display: none;
      }

      &--icon {
        display: block;
      }
    }

    &__reviews {
      &--heading {
        flex-direction: column-reverse;

        &--image {
          margin-right: 0;
          max-width: 100%;
        }

        &--title {
          flex-direction: row;
        }
      }
    }
  }
}

@media screen and (max-width: 450px) {
  .row {
    gap: 0;
  }
}

@media screen and (max-width: 435px) {
  .row {
    grid-template: 1fr / 1fr;
    max-width: 460px;
  }

  .productPage {
    &__reviews {
      grid-template: auto / auto;
      max-width: 200px;

      &--heading {
        &__image {
          max-height: 150px;
          max-width: 200px;
        }
      }
    }
  }
}

a {
  text-decoration: none !important;
  color: #3b8ede;
  cursor: pointer;
}

pre, code {
  white-space: normal;
}

.contact-tab span {
  margin-left: 8px;
}

.opening-table {
  width: auto;
  margin: 0 auto;
  background: #fff;
  border-collapse: collapse;
  font: inherit;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;

  & tr {
    background: transparent;
    border-bottom: 1px solid #eee;
  }

  & th {
    font-weight: 800;
  }

  & th, & td {
    padding: 10px 30px;
    color: #444;
    text-transform: capitalize;
    font: inherit;
    font-weight: 400;
  }
}
</style>
