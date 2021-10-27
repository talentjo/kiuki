<template>
  <div class="userAddresses">
    <template v-if="!editing">
      <h4 v-if="!noTitle">Delivery addresses</h4>

      <ul v-if="addresses && addresses.length > 0" class="address-list">
        <li v-for="address in addresses" :key="address.id" class="address-item">
          <div class="address-item__item">
            <span class="address-item__text address-item__text--no-space">
              {{ address.description }}
            </span>
          </div>
          <div class="address-item__item">
            <img
              class="address-item__icon"
              draggable="false"
              :src="UserIcon"
              alt="icon"
            />
            <span class="address-item__text">
              {{ address.recipient.firstname }} {{ address.recipient.lastname }}
            </span>
          </div>
          <div class="address-item__item">
            <img
              class="address-item__icon"
              draggable="false"
              :src="PhoneIcon"
              alt="icon"
            />
            <span class="address-item__text">
              {{ address.recipient.contact_phone }}
            </span>
          </div>
          <div class="address-item__item">
            <img
              class="address-item__icon"
              draggable="false"
              :src="EmailIcon"
              alt="icon"
            />
            <span class="address-item__text">
              {{ address.recipient.contact_email }}
            </span>
          </div>
          <div class="address-item__item">
            <img
              class="address-item__icon"
              draggable="false"
              :src="AddressIcon"
              alt="icon"
            />
            <span class="address-item__text">
              {{ address.house_number }}, {{ address.street_address }},
              {{ address.city }}, {{ address.country }}, {{ address.postcode }},
              {{ address.region_postal }}
            </span>
          </div>

          <div v-if="!listOnly" class="address-item__actions">
            <!-- <div v-if="address.is_default" class="address-item__default">
            Default
          </div> -->

            <div
              v-if="mode === 'checkout'"
              class="address-item__select-section"
            >
              <span
                v-if="$store.state.userAddressId === address.id"
                class="address-item__selected"
                >Selected</span
              >
              <button
                v-else
                class="address-item__action"
                @click.stop="selectAddress(address.id)"
              >
                Select address
              </button>
            </div>
            <button
              class="address-item__action address-item__action--space-left"
              @click.stop="editAddress(address)"
            >
              Edit
            </button>
            <button
              class="address-item__action"
              @click.stop="deleteAddress(address.id)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>

      <div v-else class="no-address">
        There are no addresses listed yet. try adding new one.
      </div>
      <BlackButton
        v-if="!listOnly"
        :loading="loading"
        @click.native.stop="openAddView"
      >
        Add new
      </BlackButton>
    </template>
    <template v-else-if="editing">
      <ValidationObserver ref="addressForm" tag="form" class="form">
        <label class="form__label" for="googleAutocomplete">Address</label>
        <vue-google-autocomplete
          id="googleAutocomplete"
          classname="form__google-autocomplete"
          autocomplete="off"
          :fields="[
            'address_components',
            'adr_address',
            'alt_id',
            'formatted_address',
            'geometry',
            'icon',
            'id',
            'name',
            'permanently_closed',
            'photo',
            'place_id',
            'scope',
            'type',
            'url',
            'utc_offset',
            'vicinity',
          ]"
          placeholder="Search for your address"
          :country="['GB']"
          @placechanged="getAddressData"
        />

        <div class="form__row">
          <div>
            <label class="form__label" for="City">City</label>
            <TextInput
              id="City"
              v-model="address_data.city"
              name="City"
              type="text"
              rules="required"
            />
          </div>
          <div>
            <label class="form__label" for="Street address">Street</label>
            <TextInput
              id="Street address"
              v-model="address_data.street_address"
              name="Street address"
              type="text"
              rules="required"
            />
          </div>
        </div>
        <!-- <ValidationProvider
          mode="passive"
          name="Country"
          rules="required"
          slim
          v-slot="{ errors }"
        >
          <select
            name="Country"
            id="Country"
            class="form__select"
            v-model="address_data.country"
            :class="{ 'select-invalid': errors && errors.length > 0 }"
          >
            <option
              v-for="(country, index) in countries"
              :key="index"
              :value="country.iso_a2"
            >
              {{ country.name }}
            </option>
          </select>
        </ValidationProvider> -->

        <div class="form__row">
          <div>
            <label class="form__label" for="House number">House number</label>
            <TextInput
              id="House number"
              v-model="address_data.house_number"
              name="House number"
              type="text"
              rules="required"
            />
          </div>
          <div>
            <label class="form__label" for="Postcode">Post Code</label>
            <TextInput
              id="Postcode"
              v-model="address_data.postcode"
              name="Postcode"
              type="text"
              rules="required"
            />
          </div>
        </div>

        <h4 class="form__title">Recipent details</h4>
        <div class="form__row">
          <div>
            <label class="form__label" for="Recipent first name"
              >First Name</label
            >
            <TextInput
              id="Recipent first name"
              v-model="address_data.recipient.firstname"
              name="Recipent first name"
              type="text"
              rules="required"
            />
          </div>

          <div>
            <label class="form__label" for="Recipent last name"
              >Last Name</label
            >
            <TextInput
              id="Recipent last name"
              v-model="address_data.recipient.lastname"
              name="Recipent last name"
              type="text"
              rules="required"
            />
          </div>
        </div>

        <label class="form__label" for="Email address">Email address</label>
        <TextInput
          id="Email address"
          v-model="address_data.recipient.contact_email"
          name="Email address"
          type="email"
          rules="required|email"
        />
        <label class="form__label" for="Phone number">Phone number</label>
        <!-- <TextInput
          name="Phone number"
          type="tel"
          v-model="address_data.recipient.contact_phone"
          required
          pattern="^\+(?:[0-9]●?){6,14}[0-9]$"
        /> -->
        <!-- :error="isContactPhoneInvalid()" -->
        <vue-phone-number-input
          v-model="contactPhone"
          name="Contact Phone"
          default-country-code="GB"
          @update="contactPhoneResult = $event"
        />

        <label class="form__label" for="Company">Note</label>
        <TextInput
          id="Company"
          v-model="address_data.recipient.company"
          name="Company"
          type="text"
        />

        <label class="form__label" for="Description"
          >Label your address so that you can use it again</label
        >
        <TextInput
          id="Description"
          v-model="address_data.description"
          name="Description"
          type="text"
          rules="required"
        />

        <div class="form__toggle-wrapper">
          <label class="form__label" for="Default address"
            >Make this my default address</label
          >
          <toggle-button v-model="address_data.is_default" />
        </div>
        <div class="form__actions">
          <BlackButton @click.native.stop="updateUserData" :loading="loading">
            Save
          </BlackButton>
          <button
            class="form__action"
            aria-label="Go back"
            @click.stop="goBack"
          >
            <span>Cancel</span>
          </button>
        </div>
      </ValidationObserver>
    </template>
  </div>
</template>

<script>
import { ValidationObserver } from 'vee-validate'
import VueGoogleAutocomplete from 'vue-google-autocomplete'

import BlackButton from '@/components/BlackButton.vue'
import TextInput from '@/components/TextInput.vue'
import httpClient from '@/services/httpClient'

import UserIcon from '@/assets/user.svg'
import PhoneIcon from '@/assets/call.svg'
import EmailIcon from '@/assets/mail.svg'
import AddressIcon from '@/assets/address.svg'

export default {
  name: 'UserAddresses',
  components: {
    BlackButton,
    TextInput,
    ValidationObserver,
    VueGoogleAutocomplete
  },
  props: {
    mode: {
      type: String,
      default: ''
    },
    noTitle: Boolean,
    listOnly: Boolean,
    separateActions: Boolean,
    initNew: Boolean,
    initEdit: Boolean,
    initEditData: Object
  },
  data () {
    return {
      UserIcon,
      PhoneIcon,
      EmailIcon,
      AddressIcon,
      editing: false,
      loading: false,
      addresses: [],
      address_id: '',
      countries: [],
      postal_regions: [],
      address_data: {
        description: '',
        street_address: '',
        city: '',
        postcode: '',
        country: 'GB',
        region_postal: '',
        house_number: '',
        is_default: false,
        recipient: {
          firstname: '',
          lastname: '',
          company: '',
          contact_email: '',
          contact_phone: ''
        }
      },
      contactPhoneResult: {},
      contactPhone: '',
      googleAutocompleteData: null
    }
  },
  watch: {
    'address_data.country': function () {
      this.getPostalRegions('GB')
    },
    initNew (val) {
      if (val) this.addAddress()
    },
    initEdit (val) {
      if (val) this.editAddress(this.initEditData)
    }
  },
  created () {
    this.getCountries()
  },
  async mounted () {
    await this.getUserAddresses()

    // make default address as selected
    const defaultAddress = this.addresses.find((address) => address.is_default)
    if (defaultAddress) {
      this.selectAddress(defaultAddress.id)
    }
  },
  methods: {
    openAddView (e) {
      e.preventDefault()
      this.separateActions ? this.$emit('add-new') : this.addAddress()
    },
    goBack (e) {
      e.preventDefault()
      this.separateActions
        ? this.$emit('finish-action')
        : (this.editing = false)
    },
    getAddressData (data) {
      this.googleAutocompleteData = data
      this.address_data.city = data.administrative_area_level_2
      if (data.street_number) {
        this.address_data.house_number = data.street_number
      }
      // const targetCountry = this.countries.find(
      //   (country) => country.name === data.country
      // )
      // if (targetCountry) {
      //   this.address_data.country = targetCountry.iso_a2
      // }
      this.address_data.country = 'GB'
      this.selectRegionBasedOnAutocompelete()
      this.address_data.street_address = data.route
      if (data.locality || data.postal_town) {
        this.address_data.city = data.locality
      }
      if (data.postal_code) this.address_data.postcode = data.postal_code
    },
    selectRegionBasedOnAutocompelete () {
      // select regoin if user filled google autocomplete
      if (
        this.postal_regions.length > 0 &&
        this.googleAutocompleteData &&
        this.googleAutocompleteData.locality
      ) {
        const targetRegion = this.postal_regions.find(
          (region) => region.name === this.googleAutocompleteData.locality
        )
        if (targetRegion) {
          this.address_data.region_postal = targetRegion.postal
        }
      }
    },
    isContactPhoneInvalid () {
      if (this.contactPhone && this.contactPhone.length > 0) {
        if (
          this.contactPhoneResult.countryCallingCode &&
          this.contactPhoneResult.countryCallingCode.length > 0
        ) {
          const combinedPhone = `+${this.contactPhoneResult.countryCallingCode}${this.contactPhoneResult.nationalNumber}`
          if (combinedPhone.match(/^\+(?:[0-9] ?){6,14}[0-9]$/)) {
            this.address_data.recipient.contact_phone = combinedPhone
            return false
          }
        }
      }

      return true
    },
    async getUserAddresses () {
      this.loading = true
      try {
        const response = await httpClient.get('/me/addresses')
        this.addresses = response.data
      } catch (error) {
        // User doesn't have a default addresses
        this.editing = true
      }
      this.loading = false
    },
    async selectAddress (id) {
      if (!id) return

      this.$store.commit('setUserAddressId', id)

      let selectedAddress = this.addresses.find((address) => address.id === id)
      if (selectedAddress.is_default) {
        return
      }
      selectedAddress = JSON.parse(JSON.stringify(selectedAddress))
      if (selectedAddress) {
        delete selectedAddress.id
        delete selectedAddress.owner
        delete selectedAddress.coordinates
        delete selectedAddress.created_at
        selectedAddress.is_default = true
        // update in api
        try {
          await httpClient({
            method: 'patch',
            url: `/me/address/${this.$store.state.userAddressId}`,
            data: selectedAddress
          })
        } catch (e) {
          console.log(e)
        }
      }
    },
    addAddress () {
      this.editing = true
      this.clearAddressData()

      // pre fill email from addresses
      if (this.$store.state.userData && this.$store.state.userData.email) {
        this.address_data.recipient.contact_email =
          this.$store.state.userData.email
      }
    },
    editAddress (address) {
      if (this.separateActions && !this.initEdit) {
        this.$emit('edit', address)
      } else {
        this.editing = true
        this.setAddressData(address)
        if (this.editing) {
          // update contact phone
          this.contactPhone = this.address_data.recipient.contact_phone
        }
      }
    },
    async getCountries () {
      try {
        const response = await httpClient.get('/search/countries')
        this.countries = response.data
      } catch (error) {
        this.$emit('openSnackbar', {
          message: 'Error fetching countries',
          type: 'error'
        })
      }
    },
    async getPostalRegions (country) {
      if (country) {
        try {
          const response = await httpClient.get(
            `/search/country/${country}/states`
          )
          this.postal_regions = response.data
          this.selectRegionBasedOnAutocompelete()
        } catch (error) {
          this.$emit('openSnackbar', {
            message: 'Error fetching postal regions for the country',
            type: 'error'
          })
        }
      }
    },
    async updateUserData (e) {
      e.preventDefault()
      const isValid = await this.$refs.addressForm.validate()
      const isPhoneInValid = this.isContactPhoneInvalid()
      if (isValid && !isPhoneInValid) {
        this.loading = true
        try {
          // make default address if there are no address added before
          if (this.addresses.length === 0) {
            this.address_data.is_default = true
          }
          this.address_data.country = 'GB'
          await httpClient({
            method: this.address_id ? 'patch' : 'post',
            url: this.address_id
              ? `/me/address/${this.address_id}`
              : '/me/address',
            data: this.address_data
          })

          this.editing = false
          this.$emit('openSnackbar', {
            message: 'Address successfully updated',
            type: 'info'
          })

          await this.getUserAddresses()

          const defaultAddress = this.addresses.find(
            (address) => address.is_default
          )
          this.$store.commit('setUserAddressId', defaultAddress.id)

          this.clearAddressData()
        } catch (error) {
          this.$emit('openSnackbar', {
            message: `Error updating the address, ${error.response.data.message}`,
            type: 'error'
          })
        }
        // this.getUserAddresses()
        this.loading = false
        if (this.separateActions) this.$emit('finish-action')
      } else {
        if (!isValid) {
          this.$emit('openSnackbar', {
            message: 'Address is not valid',
            type: 'error'
          })
        }
        if (isPhoneInValid) {
          this.$emit('openSnackbar', {
            message: 'Phone number is empty',
            type: 'error'
          })
        }
      }
    },
    clearAddressData () {
      this.contactPhone = ''
      this.address_id = ''

      this.address_data = {
        description: '',
        street_address: '',
        city: '',
        postcode: '',
        country: 'GB',
        region_postal: '',
        house_number: '',
        is_default: false,
        recipient: {
          firstname: '',
          lastname: '',
          company: '',
          contact_email: '',
          contact_phone: ''
        }
      }
    },
    setAddressData (address) {
      this.address_id = address.id

      this.address_data.description = address.description
      this.address_data.postcode = address.postcode
      this.address_data.country = 'GB'
      this.address_data.region_postal = address.region_postal
      this.address_data.city = address.city
      this.address_data.street_address = address.street_address
      this.address_data.house_number = address.house_number
      this.address_data.is_default = address.is_default
      this.address_data.recipient = address.recipient
    },
    async deleteAddress (id) {
      this.loading = true
      try {
        await httpClient.delete(`/me/address/${id}`)
        this.$emit('openSnackbar', {
          message: 'Address successfully deleted',
          type: 'info'
        })
      } catch (error) {
        this.$emit('openSnackbar', {
          message: `Something went wrong, ${error.hak_cime}`,
          type: 'error'
        })
      }
      await this.getUserAddresses()
      if (this.$store.state.userAddressId === id) {
        this.$store.commit('setUserAddressId', '')
      }
      // make default address as selected
      const defaultAddress = this.addresses.find(
        (address) => address.is_default
      )
      if (defaultAddress) {
        this.selectAddress(defaultAddress.id)
      }
      this.loading = false
    }
  }
}
</script>

<style scoped lang="stylus">
.form {
  display: flex;
  flex-direction: column;

  &__label {
    font-size: 14px;
    margin: 10px 0 5px 0;
    display: block;
  }

  &__title {
    margin: 30px 0 10px 0;
  }

  &__select {
    width: 100%;
    padding: 13px 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 15px;
  }

  &__toggle-wrapper {
    display: flex;
    margin-top: 20px;
    align-items: center;
    line-height: 1;

    & label {
      margin: 0;
      margin-right: 20px;
    }
  }

  &__actions {
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row-reverse;
  }

  &__action {
    cursor: pointer;
    background: none;
    border: none;
    font-family: inherit;
    font-size: 13px;
    margin: 0 10px;
  }

  &__google-autocomplete {
    padding: 13px 17px;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 100%;
    margin-right: 10px;
    display: inline-block;
    background-color: white;
    color: black;
    font: inherit;
    font-size: 14px;
    transition-duration: 0.12s;

    &:hover {
      border-color: #ccc;
    }

    &:focus {
      border-color: dodgerblue;
    }
  }
}

.form__row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
}

.select-invalid {
  border-color: var(--color-red) !important;
}

.address-name-block {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
}

.address-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: 10px;
  }
}

.address-item {
  padding: 10px;
  border: 1px solid #dbdbdb;
  border-radius: 5px;

  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  &__icon {
    height: 15px;
  }

  &__text {
    line-height: 1;
    margin-left: 10px;
    padding: 0;

    &--no-space {
      margin-left: 0 !important;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  &__select-setion {
    margin-right: auto;
  }

  &__selected {
    margin: 0 !important;
    color: #fff;
    background-color: var(--color-green);
    padding: 5px 7px;
    border-radius: 5px;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: bold;
  }

  &__default {
    @extend .address-item__selected;
    width: max-content;
    margin-right: 5px !important;
  }

  &__action {
    padding: 3px 7px;
    background: none;
    border: none;
    cursor: pointer;
    margin: 0 5px;
    color: var(--color-blue);
    font-weight: 500;
    font-size: 14px;
    border-radius: 5px;

    &--space-left {
      margin-left: auto;
    }
  }
}

.no-address {
  padding: 30px 10px;
  text-align: center;
}
</style>
