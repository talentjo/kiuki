<template>
  <div class="itemForm">
    <div
      v-if="editMode"
      class="itemForm__editInfo">
      <p>Editing</p>
    </div>
    <snack-bar ref="snackBar" />
    <modal-box
      ref="submitModal"
      title="Should I submit this?"
      icon="paper-plane"
      type="confirm"
      @onConfirm="editMode ? edit() : submit()" />
    <modal-box
      ref="errorModal"
      title="Oops! Something went wrong!"
      icon="sad-tear">
      {{ errorMessage }}
    </modal-box>
    <modal-box
      ref="successModal"
      title="Form submitted successfully!"
      icon="smile-wink"
      @onConfirm="$router.push('/account')" />
    <ul class="itemForm__menu">
      <li
        :class="activePageIndex === 0 ? 'itemForm__menu--active' : ''"
        @click="handlePageChange(0)">
        <i class="fal fa-info-circle" />
        Basic info
      </li>
      <li
        v-if="itemType !== 'productoffering'"
        :class="activePageIndex === 1 ? 'itemForm__menu--active' : ''"
        @click="handlePageChange(1)">
        <i class="fal fa-image" />
        {{ itemCategory === 'org' ? 'Logo' : 'Photos' }}
      </li>
      <li
        v-if="itemType === 'room'"
        :class="activePageIndex === 2 ? 'itemForm__menu--active' : ''"
        @click="handlePageChange(2)">
        <i class="fal fa-bed" />
        Room info
      </li>
      <li
        v-if="itemType === 'packagedfood' || itemType === 'product'"
        :class="activePageIndex === 2 ? 'itemForm__menu--active' : ''"
        @click="handlePageChange(2)">
        <i class="fal fa-award" />
        Certifications
      </li>
      <li
        v-if="
          itemType === 'packagedfood' ||
            itemType === 'recipe' ||
            itemType === 'dish'
        "
        :class="
          ('recipe|dish'.includes(itemType)
            ? activePageIndex === 2
            : activePageIndex === 3)
            ? 'itemForm__menu--active'
            : ''
        "
        @click="
          'recipe|dish'.includes(itemType)
            ? handlePageChange(2)
            : handlePageChange(3)
        ">
        <i class="fal fa-carrot" />
        Ingredients
      </li>
      <li
        v-if="editMode && itemTypesThatCanHaveLinks.includes(itemType)"
        :class="
          ('room|dish'.includes(itemType)
            ? activePageIndex === 3
            : activePageIndex === 2)
            ? 'itemForm__menu--active'
            : ''
        "
        @click="
          'room|dish'.includes(itemType)
            ? handlePageChange(3)
            : handlePageChange(2)
        ">
        <i class="fal fa-link" />
        Links
      </li>
    </ul>
    <div
      v-show="activePageIndex === 0"
      class="itemForm__page">
      <section>
        <div class="itemForm__inputWrapper">
          <h3>Basic info</h3>
          <input
            v-model="formData['name']"
            v-validate="'required|min:3'"
            type="text"
            class="itemForm__input itemForm__input--wide"
            name="name"
            :placeholder="itemType === 'productoffering' ? 'Label' : 'Name'">
          <span class="itemForm__error">{{ errors.first('name') }}</span>
        </div>
        <textarea
          v-if="itemType !== 'productoffering'"
          v-model="formData['description']"
          name="description"
          placeholder="Description"
          class="itemForm__input" />
        <div class="itemForm__inputWrapper itemForm__input--wide">
          <h3 v-if="itemType === 'recipe'">
            Preparation method
          </h3>
          <h3 v-else>
            Content
          </h3>
          <markdown-editor
            v-model="formData['content']"
            :configs="editorConfig"
            style="text-align: left" />
        </div>
        <div
          v-if="itemType === 'post'"
          class="itemForm__inputWrapper">
          <input
            v-model="formData.urls.link"
            type="text"
            class="itemForm__input itemForm__input--wide"
            name="urls.link"
            placeholder="Source URL">
          <span class="itemForm__error">{{ errors.first('urls.link') }}</span>
        </div>
        <div
          v-if="itemType === 'recipe'"
          class="recipeFields">
          <div>
            <span>Servings:</span>
            <NumberInput
              v-model="formData.servings"
              v-validate="'required'"
              name="servings"
              style="margin: 10px 0 0 0" />
          </div>
          <div>
            <span>Preparation time (in mins):</span>
            <NumberInput
              v-model="formData.preparation_time"
              v-validate="'required'"
              name="preparation_time"
              style="margin: 10px 0 0 0" />
          </div>
          <div>
            <select
              v-model="formData.difficulty_level"
              v-validate="'required'"
              name="difficulty_level"
              style="width: 100%">
              <option
                :value="0"
                selected
                disabled>
                Choose difficulty level
              </option>
              <option :value="1">
                Easy
              </option>
              <option :value="2">
                Medium
              </option>
              <option :value="3">
                Hard
              </option>
            </select>
          </div>
        </div>
        <div
          v-if="itemType === 'dish'"
          class="dishFields">
          <div>
            <label for="category"><b>Category: </b></label>
            <select
              v-model="formData.dish_category"
              name="dish_category">
              <option
                v-for="category in Object.keys(dishCategories)"
                :key="category"
                :value="category">
                {{ dishCategories[category] }}
              </option>
            </select>
          </div>
          <div>
            <h3>Free from</h3>
            <CheckboxList
              v-model="formData.free_from"
              :data="[
                ['gluten-free', 'Gluten-free'],
                ['soy-free', 'Soy-free'],
                ['sugar-free', 'Sugar-free'],
              ]" />
          </div>
          <div>
            <h3>Allergens</h3>
            <CheckboxList
              v-model="formData.allergens"
              :data="[
                ['balsam-of-peru', 'Balsam of Peru'],
                ['egg', 'egg'],
                ['fish', 'fish or shellfish'],
                ['fruit', 'fruit'],
                ['garlic', 'garlic'],
                ['hot-peppers', 'hot peppers'],
                ['meat', 'meat'],
                ['milk', 'milk'],
                ['oats', 'oats'],
                ['peanuts', 'peanuts'],
                ['rice', 'rice'],
                ['sesame', 'sesame'],
                ['soy', 'soy'],
                ['sulphites', 'sulphites'],
                ['tartrazine', 'tartrazine'],
                ['tree-nuts', 'tree nuts'],
                ['wheat', 'wheat'],
              ]" />
          </div>
          <div>
            Number of dishes available for sale:
            <NumberInput
              v-model="formData['available_quantity']"
              :large="true" />
          </div>
          <div>
            <h4>Price</h4>
            <div class="align-left price-input">
              <PriceInput
                v-model="formData['price']"
                :currency="selectedCurrency" />
              <select
                v-model="formData['currency']"
                name="currency"
                @input="
                  e => {
                    selectedCurrency = e.target.value
                    formData['currency'] = e.target.value
                  }
                ">
                <option
                  v-for="currency of Object.keys(currencyList)"
                  :key="currency"
                  :value="currency">
                  {{ currency }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <tag-input
          v-if="itemCategory !== 'org' && itemType !== 'productoffering'"
          ref="tag-input"
          v-model="formData['tags']" />
      </section>
      <section v-if="itemType === 'productoffering'">
        <input
          v-model="formData['unique_identifier']"
          type="text"
          class="itemForm__input itemForm__input--wide"
          name="unique_identifier"
          placeholder="Unique identifier">
      </section>
      <section
        v-if="itemCategory === 'product' && itemType !== 'productoffering'">
        <template v-if="itemType !== 'freshfood'">
          <input
            v-model="formData['sku']"
            type="text"
            class="itemForm__input itemForm__input--wide"
            name="sku"
            placeholder="Stock control identifier">
          <input
            v-model="formData['hs_code']"
            v-validate="{ regex: /[0-9]{4}\.[0-9]{2}/ }"
            type="text"
            class="itemForm__input itemForm__input--wide"
            name="hs_code"
            placeholder="Harmonized System product code">
          <span
            v-if="errors.first('hs_code')"
            class="itemForm__error">{{
              errors.first('hs_code')
            }}</span>
          <input
            v-model="formData['barcode']"
            type="text"
            class="itemForm__input itemForm__input--wide"
            name="barcode"
            placeholder="Barcode">
        </template>
      </section>
      <section
        v-if="
          itemCategory === 'venue' ||
            itemCategory === 'offer' ||
            itemCategory === 'service' ||
            itemCategory === 'org'
        ">
        <h3>
          Address
          <span
            v-if="itemCategory === 'offer' || itemCategory === 'service'"
            style="font-size: 12px; color: #999">
            (optional)
          </span>
        </h3>
        <div class="itemForm__inputWrapper">
          <input
            id="autocomplete-address"
            class="itemForm__input itemForm__input--wide"
            style="margin-bottom: 35px"
            type="text"
            placeholder="Type the name of the place or the addreess and I'll fill out stuff for you">
          <div class="itemForm__icon">
            <i class="fal fa-magic" />
          </div>
        </div>
        <google-map
          v-if="formData['location'].latitude !== 0"
          :geolocation="[
            formData['location'].longitude,
            formData['location'].latitude,
          ]" />
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.address['street_address']"
            type="text"
            class="itemForm__input"
            name="street_address"
            placeholder="Street address">
          <span class="itemForm__error">{{
            errors.first('street_address')
          }}</span>
        </div>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.address['city']"
            v-validate="itemCategory === 'venue' ? 'required|min:2' : ''"
            type="text"
            class="itemForm__input"
            name="city"
            placeholder="City">
          <span class="itemForm__error">{{ errors.first('city') }}</span>
        </div>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.address['postcode']"
            type="text"
            class="itemForm__input"
            name="postcode"
            placeholder="Postcode">
          <span class="itemForm__error">{{ errors.first('postcode') }}</span>
        </div>
        <div
          class="itemForm__inputWrapper"
          style="margin-bottom: 20px">
          <select
            v-model="formData.address['country']"
            name="country">
            <option
              v-for="country in countryList"
              :key="country.value"
              :value="country.value">
              {{ country.placeholder }}
            </option>
          </select>
          <span class="itemForm__error">{{ errors.first('country') }}</span>
        </div>
        <div
          v-if="itemCategory === 'venue' || itemCategory === 'org'"
          class="itemForm__inputWrapper">
          <input
            v-model="formData['contact_email']"
            v-validate="
              `email${formData.address.street_address ? '|required' : ''}`
            "
            type="text"
            class="itemForm__input"
            name="contact_email"
            placeholder="Contact email">
          <span class="itemForm__error">{{
            errors.first('contact_email')
          }}</span>
        </div>
        <div
          v-if="itemCategory === 'venue' || itemCategory === 'org'"
          class="itemForm__inputWrapper">
          <input
            v-model="formData['contact_phone']"
            v-validate="{
              required: !!formData.address.street_address,
              regex: /^\+(?:[0-9] ?){6,14}[0-9]$/,
            }"
            type="tel"
            class="itemForm__input"
            name="contact_phone"
            placeholder="International phone number (e.g. +44 456 342 123)">
          <span class="itemForm__error">{{
            errors.first('contact_phone')
          }}</span>
        </div>
      </section>
      <section v-if="itemCategory === 'venue' || itemCategory === 'org'">
        <h3>Social media</h3>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.urls['website']"
            type="text"
            class="itemForm__input"
            name="website"
            placeholder="Website URL">
        </div>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.urls['instagram']"
            type="text"
            class="itemForm__input"
            name="instagram"
            placeholder="Instagram">
        </div>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.urls['facebook']"
            type="text"
            class="itemForm__input"
            name="facebook"
            placeholder="Facebook">
        </div>
        <div class="itemForm__inputWrapper">
          <input
            v-model="formData.urls['linkedin']"
            type="text"
            class="itemForm__input"
            name="linkedin"
            placeholder="Linkedin">
        </div>
      </section>
      <section v-if="itemType === 'shop'">
        <h3>Amenities</h3>
        <CheckboxList
          v-model="formData.amenities"
          :data="[
            ['car-park', 'Car park'],
            ['click-and-collect', 'Click and collect'],
          ]" />
        <h3>Properties (required)</h3>
        <div
          style="text-align: left; display: grid; grid-template: 1fr/1fr 1fr">
          <div>
            <input
              v-model="formData.is_physical_store"
              type="checkbox">
            <span>Is this venue shop at a physical location?</span>
          </div>
          <div>
            <input
              v-model="formData.is_online_shop"
              type="checkbox">
            <span>Is this venue shop online?</span>
          </div>
          <div
            class="itemForm__inputWrapper"
            style="text-align: left; margin-top: 30px;">
            Minimum purchase value to get free delivery:
            <NumberInput
              v-model="formData.minimum_free_delivery"
              v-validate="'required'"
              name="minimum_free_delivery"
              style="margin: 10px 0 0 0" />
            <span class="itemForm__error">{{
              errors.first('minimum_free_delivery')
                ? "The fields can't be empty!"
                : ''
            }}</span>
          </div>
          <div
            class="itemForm__inputWrapper"
            style="text-align: left; margin-top: 30px">
            Country or region which the delivery can be made:
            <select
              v-model="formData.delivery_coverage"
              v-validate="'required'"
              style="margin: 10px 0 0 0"
              name="country">
              <option
                v-for="country in countryList"
                :key="country.value"
                :value="country.value">
                {{ country.placeholder }}
              </option>
            </select>
            <span class="itemForm__error">{{ errors.first('country') }}</span>
          </div>
        </div>
      </section>
      <section v-if="itemCategory === 'org'">
        <h3>Details</h3>
        <span>Industries:</span>
        <tag-input
          ref="industry-input"
          v-model="formData['industry']" />
        <br>
        <br>
        <span>
          <span>Year founded:</span>
          <NumberInput
            v-model="formData['year_founded']"
            name="year_founded"
            :large="true"
            :hide-buttons="true" />
        </span>
        <span>
          <span>Employees:</span>
          <NumberInput
            v-model="formData['employees']"
            name="employees"
            :large="true"
            :hide-buttons="true" />
        </span>
      </section>
      <section v-if="itemType === 'hotel'">
        <h3>Amenities</h3>
        <CheckboxList
          v-model="formData.amenities"
          :data="[
            ['car-park', 'Car Park'],
            ['reception-24hr', '24-hour reception'],
            ['free-wifi', 'Free WiFi'],
            ['restaurant', 'Restaurant'],
            ['breakfast', 'Breakfast'],
            ['lunch', 'Lunch'],
            ['dinner', 'Dinner'],
            ['bar', 'Bar'],
            ['gym', 'Gym'],
            ['pool', 'Swimming Pool'],
            ['sport-facilities', 'Sports facilities'],
            ['hot-tub', 'Hot tub'],
            ['group-friendly', 'Good for groups'],
            ['events-friendly', 'Good for events'],
            ['pets-allowed', 'Pets allowed'],
            ['smoking-allowed', 'Smoking allowed'],
            ['full-vegan', '100% vegan'],
          ]" />
      </section>
      <section v-if="itemCategory === 'venue'">
        <h3>Opening hours</h3>
        <!-- :key="`timepicker_${period.day}` is set below to prevent the keys at the bottom from losing their value when we add a slot -->
        <div
          v-for="(period, index) in formData.opening_hours[0].periods"
          :key="index"
          style="margin: 10px auto; display: grid; grid-template: 1fr / 1fr auto 1fr">
          <span class="align-left">{{ getDay(period.day) }}</span>
          <div>
            <TimeInput
              v-if="period"
              v-model="period.start" />
            <span>―</span>
            <TimeInput
              v-if="period"
              v-model="period.end" />
            <br>
            <div
              class="addTimeSlot"
              @click="addTimeSlot(formData.opening_hours[0].periods, index)">
              <i class="fal fa-plus-circle" /> Add time slot
            </div>
          </div>
          <span
            v-if="index === 0"
            style="cursor: pointer"
            @click="applyOpeningHours(formData.opening_hours[0].periods)">
            Apply to all
          </span>
        </div>
      </section>
      <template
        v-else-if="itemCategory === 'offer' || itemCategory === 'service'">
        <section>
          <h4>Price</h4>
          <div class="align-left price-input">
            <PriceInput
              v-model="formData['price']"
              :currency="selectedCurrency" />
            <select
              v-model="formData['currency']"
              name="currency"
              @input="
                e => {
                  selectedCurrency = e.target.value
                  formData['currency'] = e.target.value
                }
              ">
              <option
                v-for="currency of Object.keys(currencyList)"
                :key="currency"
                :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
          <h4>Sale Duration</h4>
          <p>
            The period of time when guests can purchase the {{ itemCategory }}.
            The {{ itemCategory }} will only be live for sale during this
            period.
          </p>
          <div class="itemForm__inputWrapper">
            <input
              v-model="formData.sale_period.start"
              v-validate="`required`"
              name="sale_period_start"
              type="date">
            -
            <input
              v-model="formData.sale_period.end"
              v-validate="`required`"
              name="sale_period_end"
              type="date">
            <span
              class="itemForm__error"
              style="bottom: -7px">{{
                errors.first('sale_period_start') ||
                  errors.first('sale_period_end')
                  ? "The fields can't be empty!"
                  : ''
              }}</span>
          </div>
          <h4>Period of Availability</h4>
          <p>
            The period of time when guests can book the {{ itemCategory }}.
            Users will only be allowed to book within these dates.
          </p>
          <div class="itemForm__inputWrapper">
            <input
              v-model="formData.available_period.start"
              v-validate="`required`"
              name="available_period_start"
              type="date">
            -
            <input
              v-model="formData.available_period.end"
              v-validate="`required`"
              name="available_period_end"
              type="date">
            <span
              class="itemForm__error"
              style="bottom: -7px">{{
                errors.first('available_period_start') ||
                  errors.first('available_period_end')
                  ? "The fields can't be empty!"
                  : ''
              }}</span>
          </div>
          <br>
          <h4>
            Fixed date
            <span
              v-if="itemCategory === 'offer' || itemCategory === 'service'"
              style="font-size: 12px; color: #999">(optional)</span>
          </h4>
          <div class="itemForm__inputWrapper">
            <input
              v-model="formData.fixed_period.start"
              name="fixed_period_start"
              type="date">
            -
            <input
              v-model="formData.fixed_period.end"
              name="fixed_period_end"
              type="date">
            <span
              class="itemForm__error"
              style="bottom: -7px">{{
                errors.first('fixed_period_start') ||
                  errors.first('fixed_period_end')
                  ? "The fields can't be empty!"
                  : ''
              }}</span>
          </div>
          <br><br>
          <div v-if="itemCategory !== 'service'">
            <label for="category"><b>Category: </b></label>
            <select
              v-model="formData['category']"
              name="category">
              <option
                v-for="category in [
                  'concert',
                  'class',
                  'sports',
                  'health',
                  'impact',
                  'food',
                  'travel',
                ]"
                :key="category"
                :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <p>Number of {{ itemCategory }}s available for sale</p>
          <NumberInput
            v-model="formData['available_quantity']"
            :large="true" />
        </section>
      </template>
      <template v-if="itemType === 'productoffering'">
        <section>
          <h3>Your price</h3>
          <div class="align-left price-input">
            <PriceInput
              v-model="formData['price']"
              :currency="selectedCurrency" />
            <select
              v-model="formData['currency']"
              name="currency"
              @input="
                e => {
                  selectedCurrency = e.target.value
                  formData['currency'] = e.target.value
                }
              ">
              <option
                v-for="currency of Object.keys(currencyList)"
                :key="currency"
                :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
          <p>Regular price:</p>
          <PriceInput
            v-model="formData['compare_at_price']"
            :currency="selectedCurrency" />
          <p>In stock</p>
          <NumberInput
            v-model="formData['available_quantity']"
            :large="true" />
        </section>
      </template>
    </div>
    <div
      v-if="itemCategory === 'room'"
      v-show="activePageIndex === 2"
      class="itemForm__page">
      <section>
        <h3>Room info</h3>
        <div
          class="itemForm__inputWrapper"
          style="margin-bottom: 35px">
          <label
            for="room_type"
            style="margin-right: 10px">Room type:</label>
          <select
            v-model="formData.room_type"
            name="room_type">
            <option
              v-for="type in [
                'single',
                'double',
                'twin',
                'apartment',
                'apartment-with-kitchen',
                'suite',
                'chalet',
                'bungalow',
                'cabin',
                'tent',
              ]"
              :key="type"
              :value="type">
              {{ type }}
            </option>
          </select>
          <span class="itemForm__error">{{ errors.first('room_type') }}</span>
        </div>
        <div class="align-left">
          <NumberInput
            v-model.number="formData.beds.single"
            style="width: 50%;">
            Single beds
          </NumberInput>
          <NumberInput
            v-model.number="formData.beds.double"
            style="width: 50%;">
            Double beds
          </NumberInput>
          <NumberInput
            v-model.number="formData.beds.sofa_bed"
            style="width: 50%;">
            Sofa beds
          </NumberInput>
          <NumberInput
            v-model.number="formData.guest_limit"
            style="width: 50%;">
            Guest limit
          </NumberInput><br>
          <NumberInput
            v-model.number="formData.room_size"
            style="width: 50%;">
            Room size (<b>m²</b>)
          </NumberInput>
        </div>
      </section>
      <section>
        <h3>Facilities</h3>
        <CheckboxList
          v-model="formData.room_facilities"
          :data="[
            ['private-bathroom', 'Private bathroom'],
            ['shower', 'Shower'],
            ['bath', 'Bath'],
            ['balcony', 'Balcony'],
            ['terrace', 'Terrace'],
            ['desk', 'Desk'],
            ['tv', 'TV'],
            ['air-conditioning', 'Air conditioning'],
            ['telephone', 'Telephone'],
            ['free-wifi', 'Free WiFi'],
            ['hairdryer', 'Hairdryer'],
            ['wardrobe', 'Wardrobe'],
            ['towels', 'Towels'],
            ['linen', 'Linen'],
            ['clothes-rack', 'Clothes Rack'],
            ['toilet-paper', 'Toilet paper'],
            ['cosmetics', 'cosmetics'],
            ['tea-coffee-maker', 'Tea/Coffee maker'],
            ['iron', 'Iron'],
            ['kitchenette', 'Kitchenette'],
            ['kitchen', 'Kitchen'],
            ['refrigerator', 'Refrigerator'],
            ['seating-area', 'Seating area'],
            ['dining-area', 'Dining area'],
            ['washing-machine', 'Washing machine'],
            ['heating', 'Heating'],
            ['cable-channels', 'Cable channels'],
            ['sofa', 'Sofa'],
            ['soundproofing', 'Soundproofing'],
            ['view', 'View'],
            ['electric-kettle', 'Electric kettle'],
            ['kitchenware', 'Kitchenware'],
            ['hypoallergenic', 'Hypoallergenic'],
            ['cleaning-products', 'Cleaning products'],
            ['dining-table', 'Dining table'],
            ['childrens-high-chair', 'Children\'s high chair'],
            ['childrens-crib', 'Children\'s crib'],
            ['drying-rack', 'Clothes drying rack'],
          ]" />
        <h3>Services</h3>
        <CheckboxList
          v-model="formData.room_services"
          :data="[
            ['daily-cleaning', 'Daily cleaning'],
            ['towel-change', 'Towel change'],
            ['linen-change', 'Linen change'],
            ['luggage-storage', 'Luggage storage'],
            ['laundry-service', 'Laundry service'],
          ]" />
        <h3>Rules</h3>
        <CheckboxList
          v-model="formData.room_rules"
          :data="[
            ['smoking-allowed', 'Smoking allowed'],
            ['pets-allowed', 'Pets allowed'],
          ]" />
        <h3>Labels</h3>
        <CheckboxList
          v-model="formData.room_labels"
          :data="[
            ['organic', 'Organic'],
            ['minimalist', 'Minimalist'],
            ['remote-work', 'Ideal for remote work'],
          ]" />
      </section>
      <section>
        <h3>Reception opening hours</h3>
        <!-- :key="`timepicker_${period.day}` is set below to prevent the keys at the bottom from losing their value when we add a slot -->
        <div
          v-for="(period, index) in formData.reception_opening_hours[0].periods"
          :key="index"
          style="margin: 10px auto; display: grid; grid-template: 1fr / 1fr auto 1fr">
          <span class="align-left">{{ getDay(period.day) }}</span>
          <div>
            <TimeInput v-model="period.start" />
            <span>―</span>
            <TimeInput v-model="period.end" />
            <br>
            <div
              class="addTimeSlot"
              @click="
                addTimeSlot(formData.reception_opening_hours[0].periods, index)
              ">
              <i class="fal fa-plus-circle" /> Add time slot
            </div>
          </div>
          <span
            v-if="index === 0"
            style="cursor: pointer"
            @click="
              applyOpeningHours(formData.reception_opening_hours[0].periods)
            ">
            Apply to all
          </span>
        </div>
      </section>
      <section>
        <h3>Price per night</h3>
        <div class="align-left price-input">
          <PriceInput
            v-model="formData['price']"
            :currency="selectedCurrency" />
          <select
            v-model="formData['currency']"
            name="currency"
            @input="
              e => {
                selectedCurrency = e.target.value
                formData['currency'] = e.target.value
              }
            ">
            <option
              v-for="currency of Object.keys(currencyList)"
              :key="currency"
              :value="currency">
              {{ currency }}
            </option>
          </select>
        </div>
      </section>
    </div>
    <div
      v-show="activePageIndex === 1 && itemType !== 'productoffering'"
      class="itemForm__page">
      <section>
        <h3>{{ itemCategory === 'org' ? 'Upload logo' : 'Photos' }}</h3>
        <photo-uploader
          ref="photo-uploader"
          v-model="formData['pictures']" />
      </section>
    </div>
    <div
      v-show="
        ('room|dish'.includes(itemType)
          ? activePageIndex === 3
          : activePageIndex === 2) &&
          editMode &&
          itemTypesThatCanHaveLinks.includes(itemType)
      "
      class="itemForm__page">
      <section>
        <h3>Manage links</h3>
        <ItemSearch
          v-if="
            allowedLinks[itemType] &&
              linkedItems.length < allowedLinks[itemType].max
          "
          placeholder="Search for item to link..."
          :included-item-types="allowedLinks[itemType].target"
          @itemSelected="item => linkItem(item)" />
        <ItemTable
          :items="linkedItems"
          :loading="false"
          :show-remove-button="true"
          @handleRemove="unlinkItem" />
      </section>
    </div>
    <div
      v-if="itemType === 'packagedfood' || itemType === 'product'"
      v-show="activePageIndex === 2"
      class="itemForm__page">
      <section>
        <CertificationInput
          v-if="activePageIndex === 2"
          v-model="formData['certifications']" />
      </section>
    </div>
    <div
      v-if="'packagedfood|recipe|dish'.includes(itemType)"
      v-show="
        'recipe|dish'.includes(itemType)
          ? activePageIndex === 2
          : activePageIndex === 3
      "
      class="itemForm__page">
      <section>
        <IngredientsInput
          v-model="formData['ingredients']"
          :item-type="itemType" />
      </section>
    </div>
    <footer>
      <span
        v-if="activePageIndex > 0 && itemType !== 'productoffering'"
        @click="activePageIndex--">Previous page</span>
      <span
        v-if="
          activePageIndex < 1 &&
            (editMode ? editMode : itemType !== 'productoffering')
        "
        @click="
          itemType === 'productoffering'
            ? handlePageChange(2)
            : handleNextPage()
        ">
        Next page
      </span>
      <span
        v-if="
          activePageIndex === 1 &&
            ('packagedfood|room|product|recipe|dish'.includes(itemType) ||
            (editMode && itemTypesThatCanHaveLinks.includes(itemType)))
        "
        @click="handleNextPage()">
        Next page
      </span>
      <span
        v-if="
          activePageIndex === 2 &&
            (itemType == 'packagedfood' ||
            (editMode &&
            itemTypesThatCanHaveLinks.includes(itemType) &&
            'packagedfood|room|product|recipe|dish'.includes(itemType)))
        "
        @click="handleNextPage()">
        Next page
      </span>
      <span
        v-if="checkSubmit()"
        @click="handleSubmit()">
        <b>
          {{ editMode ? 'Save changes' : 'Create item' }}
        </b>
      </span>
    </footer>
  </div>
</template>

<script>
import TagInput from '@/components/account/inputs/TagInput.vue'
import NumberInput from '@/components/account/inputs/NumberInput.vue'
import CheckboxList from '@/components/account/inputs/CheckboxList.vue'
import TimeInput from '@/components/account/inputs/TimeInput.vue'
import PriceInput from '@/components/account/inputs/PriceInput.vue'
import CertificationInput from '@/components/account/inputs/CertificationInput.vue'
import IngredientsInput from '@/components/account/inputs/IngredientsInput.vue'

import PhotoUploader from '@/components/PhotoUploader.vue'
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import GoogleMap from '@/components/account/GoogleMap.vue'
import SnackBar from '@/components/account/global/SnackBar.vue'
import ItemSearch from '@/components/account/atoms/ItemSearch.vue'
import ItemTable from '@/components/account/ItemTable.vue'

import countryList from '@/assets/countryList.json'
import currencyList from '@/assets/currencyList.json'

import httpClient from '@/services/httpClient'
import clone from 'clone'

export default {
  name: 'ItemForm',
  components: {
    TagInput,
    NumberInput,
    CheckboxList,
    TimeInput,
    PhotoUploader,
    markdownEditor,
    GoogleMap,
    SnackBar,
    ItemSearch,
    ItemTable,
    PriceInput,
    CertificationInput,
    IngredientsInput
  },
  props: {
    itemType: String,
    itemCategory: String,
    editMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      countryList,
      currencyList,
      links: [],
      dishCategories: {},
      selectedCurrency: 'GBP',
      linkedItems: [],
      activePageIndex: 0,
      autocompleteAddressInput: '',
      editorConfig: {
        hideIcons: ['side-by-side', 'fullscreen']
      },
      itemTypesThatCanHaveLinks: [
        'room',
        'offer',
        'service',
        'article',
        'post',
        'productoffering',
        'dish',
        'recipe'
      ],
      opening_hours_object: [
        {
          season: 'All year',
          periods: [
            {
              is_overnight: false, day: 0, start: '', end: ''
            },
            {
              is_overnight: false, day: 1, start: '', end: ''
            },
            {
              is_overnight: false, day: 2, start: '', end: ''
            },
            {
              is_overnight: false, day: 3, start: '', end: ''
            },
            {
              is_overnight: false, day: 4, start: '', end: ''
            },
            {
              is_overnight: false, day: 5, start: '', end: ''
            },
            {
              is_overnight: false, day: 6, start: '', end: ''
            }
          ]
        }
      ],
      allowedLinks: {
        room: {
          target: ['hotel'],
          max: 1
        },
        offer: {
          target: ['hotel', 'restaurant', 'cafe', 'room'],
          max: 1
        },
        service: {
          target: ['hotel', 'restaurant', 'cafe', 'room'],
          max: 1
        },
        dish: {
          target: ['hotel', 'restaurant', 'cafe', 'room'],
          max: 1
        },
        article: {
          target: ['any'],
          max: 999
        },
        post: {
          target: ['any'],
          max: 999
        },
        productoffering: {
          target: [
            'product',
            'packagedfood',
            'freshfood',
            'fashion',
            'cosmetics'
          ],
          max: 1
        }
      },
      errorMessage: ''
    }
  },
  computed: {
    formData () {
      // Add fields common to all item types
      let formData = {
        item_type: this.itemType,
        content: '',
        name: '',
        description: '',
        tags: [],
        lang: 'en',
        pictures: [],
        featured_picture: '',
        urls: {}
      }
      // Add fields common to given item category
      switch (this.itemCategory) {
        case 'venue':
          formData = {
            ...formData,
            address: {
              street_address: '',
              city: '',
              postcode: '',
              country: 'GB'
            },
            location: {
              latitude: 0,
              longitude: 0
            },
            contact_email: '',
            contact_phone: '',
            opening_hours: this.opening_hours_object,
            is_physical_store: false,
            is_online_shop: false,
            minimum_free_delivery: 0,
            delivery_coverage: 'GB',
            amenities: []
          }
          break
        case 'org':
          formData = {
            name: '',
            description: '',
            logo: '',
            address: {
              street_address: '',
              city: '',
              postcode: '',
              country: 'GB'
            },
            urls: {
              website: '',
              facebook: '',
              instagram: '',
              linkedin: ''
            },
            industry: ['vegan'],
            year_founded: 1970,
            employees: 1,
            location: {
              latitude: 0,
              longitude: 0
            },
            contact_email: '',
            contact_phone: ''
          }
          break
        case 'room':
          formData = {
            ...formData,
            beds: {
              single: 0,
              double: 0,
              sofa_bed: 0
            },
            guest_limit: 1,
            room_size: 40,
            amenities: [],
            room_type: 'single',
            room_facilities: [],
            room_services: [],
            check_in_time: '0000',
            check_out_time: '0000',
            price: 0,
            currency: 'GBP',
            is_available: true,
            reception_opening_hours: this.opening_hours_object,
            room_rules: [],
            room_labels: []
          }
          break
        case 'packagedfood':
          formData = {
            ...formData,
            certifications: [],
            ingredients: []
          }
          break
        case 'product':
          formData = {
            ...formData,
            certifications: [],
            sku: '',
            hs_code: '',
            barcode: ''
          }
          break
        // Fall through below
        case 'offer':
        case 'service':
          formData = {
            ...formData,
            sale_period: { start: null, end: null },
            available_period: { start: null, end: null },
            fixed_period: { start: null, end: null },
            currency: 'GBP',
            price: 0,
            is_available: true,
            address: {
              street_address: '',
              city: '',
              postcode: '',
              country: 'GB'
            },
            location: {
              latitude: 0,
              longitude: 0
            },
            category: 'concert',
            recurrent_payment: false,
            available_quantity: 1,
            contact_email: '',
            contact_phone: ''
          }
      }
      if (this.itemType === 'productoffering') {
        formData = {
          ...formData,
          currency: 'GBP',
          price: 0,
          description: '',
          unique_identifier: '',
          tags: ['emptytag'],
          featured_picture: '',
          pictures: [],
          compare_at_price: 0,
          available_quantity: 1
        }
      }
      if (this.itemType === 'recipe') {
        formData = {
          ...formData,
          ingredients: [],
          servings: 0,
          difficulty_level: 0,
          preparation_time: 0
        }
      }
      if (this.itemType === 'dish') {
        formData = {
          ...formData,
          ingredients: [],
          free_from: [],
          allergens: [],
          price: 0,
          currency: 'GBP',
          available_quantity: 0,
          dish_category: 'breakfast'
        }
      }
      return formData
    }
  },
  mounted () {
    if (this.editMode) {
      this.prefillForm()
    }
    if (
      this.itemCategory !== 'venue' &&
      this.itemCategory !== 'offer' &&
      this.itemCategory !== 'service' &&
      this.itemCategory !== 'org'
    ) { return }
    // eslint-disable-next-line no-undef
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete-address'),
      { types: ['establishment'] }
    )
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace()
      this.formData.location = {
        longitude: place.geometry.location.lng(),
        latitude: place.geometry.location.lat()
      }
      this.formData.address.postcode = ''
      this.formData.address.country = ''
      this.formData.address.street_address = ''
      this.formData.address.city = ''
      for (let i = 0; i < place.address_components.length; i++) {
        for (let j = 0; j < place.address_components[i].types.length; j++) {
          if (place.address_components[i].types[j] === 'postal_code') {
            this.formData.address.postcode = place.address_components[i].long_name
          } else if (place.address_components[i].types[j] === 'country') {
            this.formData.address.country = place.address_components[i].short_name
          } else if (place.address_components[i].types[j] === 'route') {
            this.formData.address.street_address = place.address_components[i].long_name
          } else if (
            place.address_components[i].types[j] === 'locality' ||
            place.address_components[i].types[j] === 'postal_town'
          ) {
            this.formData.address.city = place.address_components[i].long_name
          }
        }
      }
      this.formData.contact_phone = place.international_phone_number || ''
      this.formData.name = place.name
      // this.formData.website = place.website
      this.$forceUpdate()
    })
  },
  created () {
    this.getCategory('dish-category')
  },
  methods: {
    getCategory (category) {
      httpClient
        .get(`/category/${category}`)
        .then((response) => {
          this.dishCategories = response.data
        })
        .catch((error) => {
          console.log(error)
          this.dishCategories = {}
        })
    },
    applyOpeningHours (periods) {
      const { start } = periods[0]
      const { end } = periods[0]
      const { isOvernight } = periods[0]
      periods.forEach((element, index) => {
        element.is_overnight = isOvernight
        element.start = start
        element.end = end
      })
      this.$forceUpdate()
    },
    prefillForm () {
      let url = `/item/${this.$route.params.id}`
      if (this.itemCategory === 'org') {
        url = `/org/${this.$route.params.id}`
      }
      httpClient
        .get(url)
        .then((response) => {
          Object.entries(response.data).forEach(([key, value]) => {
            if (typeof this.formData[key] !== 'undefined' && key !== 'lang') {
              this.formData[key] = value
            }
          })
          if (response.data.content) {
            this.formData.content = response.data.content
          }
          if (response.data.ingredients) {
            this.formData.ingredients = response.data.ingredients
          }
          if (this.itemCategory === 'org') {
            this.$refs['photo-uploader'].restorePictures([response.data.logo])
          }
          this.$refs['photo-uploader'].restorePictures(response.data.pictures)
          this.$forceUpdate()
        })
        .catch((error) => {
          console.error(error)
        })
      this.getLinkedItems()
    },
    checkSubmit () {
      const pg = this.activePageIndex
      const type = this.itemType
      const edit = this.editMode
      const category = this.itemCategory
      if (pg === 0) {
        if (!edit && type === 'productoffering') {
          return true
        }
        return false
      } if (pg === 1) {
        if (
          !edit &&
          ('venue|media|org|product'.includes(category) ||
          'service|offer'.includes(type))
        ) {
          if (type === 'packagedfood') {
            return false
          } return true
        } if (
          edit &&
          'org|productoffering|restaurant|cafe'.includes(type)
        ) {
          return true
        } return false
      } if (pg === 2) {
        if (!edit && 'room|dish|recipe'.includes(type)) {
          return true
        } if (edit && this.itemTypesThatCanHaveLinks.includes(type)) {
          if ('room|dish|recipe|packagedfood'.includes(type)) {
            return false
          } return true
        }
      } else if (pg === 3) {
        if (!edit && 'room|packagedfood'.includes(type)) {
          return true
        } if (edit && 'dish|recipe'.includes(type)) {
          return true
        } return true
      } else return true
    },
    handleSubmit () {
      this.$validator.validate().then((valid) => {
        if (valid) {
          if (this.editMode) {
            this.edit()
          } else {
            this.submit()
          }
        } else {
          this.$refs.snackBar.show('Please fill the form properly')
        }
      })
    },
    handleNextPage () {
      // Check if all inputs are valid before moving on
      this.$validator.validate().then((valid) => {
        if (valid) {
          this.activePageIndex++
        } else {
          this.$refs.snackBar.show('Please fill the form properly')
        }
      })
    },
    getLinkedItems () {
      httpClient
        .get(`/item/${this.$route.params.id}/links?page=1&per_page=100`)
        .then((response) => {
          this.links = response.data
          for (const link of this.links) {
            httpClient.get(`/item/${link.target}`).then((response2) => {
              this.linkedItems.push(response2.data)
            })
          }
        })
    },
    linkItem (item) {
      let linkType = ''
      switch (this.itemType) {
        case 'article':
        case 'post':
          linkType = 'is-media-for'
          break
        case 'room':
          linkType = 'is-room-in-hotel'
          break
        case 'offer':
        case 'service':
          linkType = 'is-offered-by'
          break
        case 'productoffering':
          linkType = 'is-offering-for'
          break
      }

      if (linkType) {
        httpClient
          .post(`/item/${this.$route.params.id}/links`, {
            link_type: linkType,
            target: item.id
          })
          .then((response) => {
            this.linkedItems.push(item)
          })
      }
    },
    unlinkItem (itemId) {
      const linkId = this.links.find((link) => link.target === itemId).id
      httpClient.delete(`item-link/${linkId}`).then((response) => {
        this.linkedItems = this.linkedItems.filter((item) => item.id !== itemId)
      })
    },
    handlePageChange (newPageIndex) {
      if (newPageIndex > this.activePageIndex) {
        // Check if all inputs are valid before moving on
        this.$validator.validate().then((valid) => {
          if (valid) {
            this.activePageIndex = newPageIndex
          } else {
            this.$refs.snackBar.show('Please fill the form properly')
          }
        })
      } else {
        // Move to previous pages freely
        this.activePageIndex = newPageIndex
      }
    },
    submit () {
      const postURL = this.itemCategory === 'org' ? '/orgs' : '/items'
      httpClient
        .post(postURL, this.getCleanFormData())
        .then((response) => {
          this.$refs.successModal.show = true
          if (this.itemCategory === 'org') {
            this.selectedOrg = response.data
            this.$cookies.set('orgData', response.data)
            this.$store.commit('setOrgData', response.data)
            this.$store.commit('addOrg')
          }
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          this.errorMessage = error.response.data.message
        })
    },
    edit () {
      const editFormData = this.getCleanFormData()
      delete editFormData.owner
      delete editFormData.item_type
      const postURL = this.itemCategory === 'org' ? '/org/' : '/item/'
      httpClient
        .patch(postURL + this.$route.params.id, editFormData)
        .then((response) => {
          this.$store.commit('setOrgData', response.data)
          this.$refs.successModal.show = true
        })
        .catch((error) => {
          this.$refs.errorModal.show = true
          this.errorMessage = error.response.data.message
        })
    },
    getCleanFormData () {
      const formData = clone(this.formData)
      if (formData.address) {
        if (formData.address.street_address === '') {
          delete formData.address
        }
      }
      if (!formData.contact_email) {
        delete formData.contact_email
      }
      if (!formData.contact_phone) {
        delete formData.contact_phone
      }
      if (this.itemCategory === 'product') {
        if (formData.unique_identifier === '') {
          delete formData.unique_identifier
        }
        if (formData.sku === '') {
          delete formData.sku
        }
        if (formData.hs_code === '') {
          delete formData.hs_code
        }
        if (formData.barcode === '') {
          delete formData.barcode
        }
      }
      if (this.itemType === 'dish') {
        delete formData.amenities
        delete formData.certifications
      }
      if (this.itemType === 'productoffering') {
        delete formData.certifications
        delete formData.sku
        delete formData.hs_code
        delete formData.barcode
      }
      if (this.itemType !== 'shop' && this.itemCategory === 'venue') {
        delete formData.is_online_shop
        delete formData.is_physical_store
        delete formData.minimum_free_delivery
        delete formData.delivery_coverage
      }
      if (this.itemCategory === 'offer' || this.itemCategory === 'service') {
        delete formData.contact_email
        delete formData.contact_phone
        if (this.itemCategory === 'service') {
          delete formData.category
        }
      }
      if (formData.location) {
        if (
          formData.location.latitude === 0 &&
          formData.location.longitude === 0
        ) {
          delete formData.location
        }
      }
      if (formData.opening_hours) {
        const { periods } = formData.opening_hours[0]
        for (let i = periods.length - 1; i > 0; i--) {
          if (periods[i].start === '' || periods[i].end === '') {
            periods.splice(i, 1)
          } else if (periods[i].start >= periods[i].end) {
            periods[i].is_overnight = true
          } else {
            periods[i].is_overnight = false
          }
        }
      }
      if (formData.reception_opening_hours) {
        const { periods } = formData.reception_opening_hours[0]
        for (let i = periods.length - 1; i > 0; i--) {
          if (periods[i].start === '' || periods[i].end === '') {
            periods.splice(i, 1)
          } else if (periods[i].start >= periods[i].end) {
            periods[i].is_overnight = true
          } else {
            periods[i].is_overnight = false
          }
        }
      }
      if (formData.check_in_time === '') {
        delete formData.check_in_time
      }
      if (formData.check_out_time === '') {
        delete formData.check_out_time
      }
      if (formData.fixed_period) {
        if (!formData.fixed_period.start || !formData.fixed_period.end) {
          delete formData.fixed_period
        }
      }
      if (typeof formData.featured_picture !== 'undefined') {
        formData.featured_picture = formData.pictures[0]
      }
      if (typeof formData.logo !== 'undefined') {
        formData.logo = formData.pictures[0]
      }
      formData.owner = this.$store.state.orgData
        ? this.$store.state.orgData.id
        : this.$store.state.userData.id
      return formData
    },
    getDay (day) {
      const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]
      return days[day]
    },
    addTimeSlot (periods, index) {
      const { day } = periods[index]
      periods.splice(index + 1, 0, {
        is_overnight: false,
        day,
        start: '',
        end: ''
      })
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang="stylus">
@import '~simplemde/dist/simplemde.min.css'

.itemForm
  display block
  margin 0 auto
  max-width 1000px
  padding 0 30px 30px 30px
  background white
  box-shadow 0 0 14px rgba(0, 0, 0, .04)
  &__menu
    height 50px
    border-bottom 1px solid #ddd
    display flex
    padding 0
    align-items center
    justify-content space-around
    li
      list-style-type none
      cursor pointer
    &--active
      font-weight 900
  &__page
    display block
  footer
    height 60px
    display flex
    align-items center
    justify-content space-around
    span
      cursor pointer
  input[type=date]
    height 42px
    padding-left 10px
    font inherit
    margin 10px 5px
    border 1px solid rgba(0,0,0,.2)
    background #fff
  select
    height 42px
    max-width 300px
    padding-left 8px
    min-width 100px
    background white
    border 2px solid rgba(0,0,0,.1)
    font inherit
    margin 0 10px 0 10px
    &:disabled
      color #777
  section
    padding-bottom 30px
    margin 0 auto
    max-width 640px
    border-bottom 1px solid #f4f4f4
    h3
      padding 15px 0
    span
      margin 0 8px
  &__section--wide
    max-width 1000px !important
  &__inputWrapper
    display inline-block
    position relative
  &__input
    position relative
    border none
    background #fff
    min-width 300px
    margin 10px
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
  &__error
    display inline-block
    font-size 11px
    text-align left
    width 100%
    color #f00
  &__editInfo
    width 100%
    border-bottom 1px solid red
    border-top 1px solid transparent
    color red
    text-align center
  &__checkbox
    display inline-block
    padding 6px
  &__priceInput
    margin 8px 0
    display flex
    align-items center
    justify-content center
    width 100%
    input
      padding 6px 12px
      font-size 14px
      border 1px solid #bbb
      background #fafafa
      border-right none
    select
      -webkit-appearance none
      padding 8px 12px
      margin-right 20px
      border 2px solid #ddd
  &__select
    -webkit-appearance none
    padding 8px 12px
    border 2px solid #ddd
  textarea
    min-width 620px
    min-height 150px
    padding 10px
  &__icon
    width 30px
    height 30px
    position absolute
    right 16px
    top 12px
    &--blue
     color #339af0
.align-left
  text-align left
.price-input
  display grid
  grid-template 1fr / 1fr 1fr
.recipeFields
  margin 20px 0
  display flex
  flex-wrap wrap
  justify-content space-between
  div
    margin 10px 0
.dishFields
  margin 20px 0
  display flex
  flex-wrap wrap
  justify-content space-between
  flex-direction column
  div
    margin 10px 0
.addTimeSlot
  cursor pointer
  margin 0
  padding 5px 0 0 0
  font-size 12px
  text-align right
</style>
