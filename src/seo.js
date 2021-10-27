export function getMetaTags (seo) {
  const tags = []

  if (seo.metaTitle) {
    tags.push(
      {
        property: 'og:title',
        content: seo.metaTitle
      },
      {
        name: 'twitter:title',
        content: seo.metaTitle
      },
      {
        itemprop: 'name',
        content: `${seo.metaTitle} - Mighty Plants`
      }
    )
  }
  if (seo.metaDescription) {
    tags.push(
      {
        name: 'description',
        content: seo.metaDescription
      },
      {
        property: 'og:description',
        content: seo.metaDescription
      },
      {
        name: 'twitter:description',
        content: seo.metaDescription
      }
    )
  }
  if (seo.url) {
    tags.push({
      property: 'og:url',
      content: `https://mightyplants.com/${seo.url}`
    })
  }
  if (seo.shareImage) {
    const imageUrl = seo.shareImage
    tags.push(
      {
        name: 'image',
        content: imageUrl
      },
      {
        itemprop: 'image',
        content: imageUrl
      },
      {
        property: 'og:image',
        content: imageUrl
      },
      {
        property: 'og:image:secure_url',
        content: imageUrl
      },
      {
        name: 'twitter:image',
        content: imageUrl
      }
    )
  }
  tags.push({ name: 'twitter:card', content: 'summary_large_image' })
  tags.push({ property: 'og:type', content: 'website' })
  return tags
}

export function getJsonLd (json) {
  const result = {}

  result['@context'] = 'http://schema.org/'

  if (json.type) {
    result['@type'] = json.type
  }
  if (json.name) {
    result['name'] = json.name
  }
  if (json.description) {
    result['description'] = json.description
  }
  if (json.image) {
    result['image'] = json.image
  }
  if (json.recipeIngredient) {
    result['recipeIngredient'] = json.recipeIngredient
  }
  if (json.recipeInstructions) {
    result['recipeInstructions'] = json.recipeInstructions
  }
  if (json.prepTime) {
    result['prepTime'] = json.prepTime
  }
  if (json.cookTime) {
    result['cookTime'] = json.cookTime
  }
  if (json.author) {
    result['author'] = json.author
  }
  if (json.keywords) {
    result['keywords'] = json.keywords
  }
  if (json.sku) {
    result['sku'] = json.sku
  }
  if (json.offers) {
    result['offers'] = json.offers
  }
  if (json.email) {
    result['email'] = json.email
  }
  if (json.telephone) {
    result['telephone'] = json.telephone
  }
  if (json.address) {
    result['address'] = json.address
  }
  if (json.aggregateRating) {
    result['aggregateRating'] = json.aggregateRating
  }
  if (json.brand) {
    result['brand'] = json.brand
  }
  if (json.review) {
    result['review'] = json.review
  }
  if (json.servesCuisine) {
    result['servesCuisine'] = json.servesCuisine
  }
  if (json.geo) {
    result['geo'] = json.geo
  }
  if (json.url) {
    result['url'] = json.url
  }
  return result
}
