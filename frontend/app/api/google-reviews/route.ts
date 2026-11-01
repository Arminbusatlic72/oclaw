import {NextResponse} from 'next/server'

import {fetchGoogleReviews} from '@/lib/google-reviews'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await fetchGoogleReviews()
    return NextResponse.json(payload, {
      headers: {'Cache-Control': 'private, no-store, max-age=0'},
    })
  } catch (error) {
    console.error('Unable to load Google Reviews:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {error: 'Google Reviews are temporarily unavailable.'},
      {status: 503, headers: {'Cache-Control': 'private, no-store, max-age=0'}},
    )
  }
}
