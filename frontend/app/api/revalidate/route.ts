import {revalidatePath, revalidateTag} from 'next/cache'
import type {NextRequest} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

import {
  createRevalidationHandler,
  type SanityRevalidationPayload,
} from '@/lib/sanity-revalidation'

export const runtime = 'nodejs'

const handleRevalidation = createRevalidationHandler({
  secret: process.env.SANITY_REVALIDATE_SECRET,
  parseBody: (request, secret) =>
    parseBody<SanityRevalidationPayload>(request as NextRequest, secret),
  revalidatePath,
  revalidateTag,
})

export async function POST(request: NextRequest) {
  return handleRevalidation(request)
}
