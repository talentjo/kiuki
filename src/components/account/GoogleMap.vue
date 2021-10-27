<template>
  <div class="googleMap" />
</template>

<script>
/* eslint-disable */
export default {
  name: 'GoogleMap',
  props: { geolocation: [Array,  Object] },
  data: function() {
    return {
      searchOpen: false,
    }
  },
  mounted() {
    this.loadMap()
  },
  methods: {
    loadMap() {
      let geolocation
      if (Array.isArray(this.geolocation)) {
        geolocation = { lat: this.geolocation[1], lng: this.geolocation[0] }
      } else {
        geolocation = { lat: this.geolocation.latitude, lng: this.geolocation.longitude }
      }
      var map = new google.maps.Map(
        document.getElementsByClassName('googleMap')[0],
        { zoom: 15, center: geolocation }
      )
      new google.maps.Marker({ position: geolocation, map: map })
    },
  },
  watch: {
    geolocation(to, from) {
      this.loadMap()
    },
  },
}
</script>

<style scoped lang="stylus">
.googleMap
  margin 0 auto 15px auto
  display block
  width 100%
  height 200px
  background-color #eee
</style>
