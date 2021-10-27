<template>
  <div class="home">
    <template v-if="!userLoggedIn">
      <p>Please login to continue</p>
    </template>
    <section v-else>
      <p>
        <router-link
          to="/account/new/packagedfood">
          <b>Add Product (Item)</b>
        </router-link>
      </p>
      <p>
        <router-link
          to="/account/new/productoffering">
          <b>Add Product offering (Item)</b>
        </router-link>
      </p>
    </section>
  </div>
</template>

<script>
import image1 from '@/assets/image1.png'
import image2 from '@/assets/image2.png'
import image3 from '@/assets/image3.png'

export default {
  name: 'Home',
  props: {
    userLoggedIn: Boolean
  },
  data () {
    return {
      cards: [
        {
          title: 'For content creators',
          image: image1,
          description: 'A better way of creating and distributing ethical content across digital channels and projects.',
          footer: 'Create and edit all your content from one hub.'
        },
        {
          title: 'For business owners',
          image: image2,
          description:
            'Manage your business listing, reviews, blog, reservations and messages from one dashboard.',
          footer: 'We keep your business updated across the internet.'
        },
        {
          title: 'For developers',
          image: image3,
          description:
            'Build content rich applications by using one simple API with geo search.',
          footer: 'We help you delivering better digital experiences.'
        }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
.home
  display block
  margin 0 auto
  height 100%
  max-width 950px
  section
    text-align left
    margin 0 auto
    max-width 800px
    width 100%
    padding 0 10px
    line-height 1.7em
    font-size 15px
    h1
      font-size 34px
  &__header
    position relative
    margin 0 auto 70px auto
    max-width 900px
    height 430px
    background-image url('../../assets/header.jpg')
    box-shadow inset 0 0 0 1000px rgba(0, 0, 0, .1)
    background-position center
    background-size cover
    h1
      font-size 34px
      font-weight 800
    p
      max-width 500px
    .text
      line-height 25px
      text-align left
      position absolute
      bottom 0
      left 30px
      background white
      padding 20px 60px 20px 20px
      b
        font-size 18px
      h1
        line-height: 1.2
  &__cards
    margin 0 auto 70px auto
    max-width 900px
    display grid
    grid-template 1fr / 1fr 1fr 1fr
    gap 20px
  &__card
    min-width 260px
    max-height 500px
    text-align left
    overflow hidden
    h2
      font-size 22px
      text-transform capitalize
  &__image
    min-width 260px
    height 230px
    background-size cover
    background-position center
  &__description
    padding 15px 0
    font-weight 100
    line-height 1.5em
    p
      color #222
      font-size 15px
  &__menu
    width 100%
    height 50px
    margin 0 auto 40px auto
    padding 0 20px
    padding-top 20px
    display flex
    align-items center
    justify-content space-between
    a, span
      cursor pointer
  &__sites
    margin 30px auto 30px auto
    max-width 900px
    display grid
    grid-template 1fr / 1fr 1fr 1fr
    gap 15px
  &__button
    height 36px
    padding 0 20px
    border none
    font-family 'Heebo'
    font-size 15px
    font-weight 800
    color black
    border 1px solid black
    background transparent
    cursor pointer
    &:hover
      opacity .6
    &--white
      border-color white
      color white
  footer
    color #666

@media screen and (max-width: 955px)
  .home
    &__sites
      grid-template 1fr / 1fr 1fr 1fr
    &__cards
      grid-template 1fr / 1fr 1fr 1fr
@media screen and (max-width: 780px)
  .home
    &__sites
      grid-template 1fr / 1fr 1fr
      margin 20px auto 30px auto
    &__cards
      grid-template 1fr / 1fr 1fr
      margin 0 auto 0 auto
    .text
      padding 20px 20px 20px 20px
@media screen and (max-width: 560px)
  .home
    &__sites
      grid-template 1fr / 1fr
      margin 20px auto 30px auto
    &__cards
      grid-template 1fr / 1fr
      margin 0 auto 0 auto
    .text
      padding 20px 20px 20px 20px
@media screen and (max-width: 435px)
  .home
    &__sites
      grid-template 1fr / 1fr
      margin 20px auto 30px auto
    &__cards
      grid-template 1fr / 1fr
      margin 0 auto 0 auto
    .text
      padding 20px 20px 20px 20px
</style>
