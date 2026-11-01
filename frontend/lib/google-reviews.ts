export type PublicReview = {
  id: string
  authorName: string
  authorPhotoUrl?: string
  authorUrl?: string
  rating: number
  text: string
  relativeTime?: string
  publishTime?: string
  googleMapsUrl?: string
  source: 'google'
}

export type GoogleReviewsPayload = {
  placeName: string
  placeRating?: number
  reviewCount?: number
  googleMapsUrl?: string
  reviews: PublicReview[]
  orderingNotice: string
}

type GooglePlaceResponse = {
  displayName?: {text?: string}
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: Array<{
    name?: string
    rating?: number
    text?: {text?: string}
    relativePublishTimeDescription?: string
    publishTime?: string
    googleMapsUri?: string
    authorAttribution?: {
      displayName?: string
      uri?: string
      photoUri?: string
    }
  }>
}

export async function fetchGoogleReviews(): Promise<GoogleReviewsPayload> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim()
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID?.trim()

  if (!apiKey || !placeId) {
    throw new Error('Google Reviews is not configured.')
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,googleMapsUri,reviews',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Google Places request failed with status ${response.status}.`)
  }

  const place = (await response.json()) as GooglePlaceResponse
  const reviews = (place.reviews || [])
    .filter((review) => review.text?.text && review.authorAttribution?.displayName)
    .map((review, index): PublicReview => ({
      id: review.name || `${placeId}-${index}`,
      authorName: review.authorAttribution?.displayName || 'Google reviewer',
      authorPhotoUrl: review.authorAttribution?.photoUri,
      authorUrl: review.authorAttribution?.uri,
      rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
      text: review.text?.text || '',
      relativeTime: review.relativePublishTimeDescription,
      publishTime: review.publishTime,
      googleMapsUrl: review.googleMapsUri || place.googleMapsUri,
      source: 'google',
    }))

  return {
    placeName: place.displayName?.text || 'Google Reviews',
    placeRating: place.rating,
    reviewCount: place.userRatingCount,
    googleMapsUrl: place.googleMapsUri,
    reviews,
    orderingNotice: 'Google Reviews are shown in relevance order.',
  }
}
