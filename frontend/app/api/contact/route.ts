import {NextRequest, NextResponse} from 'next/server'

import {validateContactSubmission} from '@/lib/contact-form'
import {ContactDeliveryNotConfiguredError, deliverContactSubmission} from '@/lib/contact-delivery'
import {client} from '@/sanity/lib/client'

export const runtime = 'nodejs'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, {count: number; resetAt: number}>()
const completed = new Map<string, number>()

function limited(key: string, now: number) {
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, {count: 1, resetAt: now + WINDOW_MS})
    return false
  }
  current.count += 1
  return current.count > MAX_ATTEMPTS
}

function error(locale: 'en' | 'es', status: number, code: string, errors?: Record<string, string>) {
  const message = locale === 'es' ? 'No se pudo enviar su solicitud. Inténtelo de nuevo.' : 'We could not send your request. Please try again.'
  return NextResponse.json({ok: false, code, message, errors}, {status})
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) return error('en', 403, 'origin')
  const now = Date.now()
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown'
  if (limited(ip, now)) return error('en', 429, 'rate_limited')

  let body: unknown
  try {
    if (!request.headers.get('content-type')?.includes('application/json')) return error('en', 415, 'content_type')
    body = await request.json()
  } catch {
    return error('en', 400, 'invalid_json')
  }
  const locale = body && typeof body === 'object' && (body as {locale?: unknown}).locale === 'es' ? 'es' : 'en'
  const validated = validateContactSubmission(body, now)
  if (!validated.ok) return error(locale, 400, 'validation', validated.errors)
  const submission = validated.data
  const previous = completed.get(submission.submissionId)
  if (previous && previous > now - 24 * 60 * 60 * 1000) return NextResponse.json({ok: true, duplicate: true})

  try {
    const [practiceArea, office] = await Promise.all([
      submission.practiceAreaId ? client.fetch<{title?: string} | null>('*[_type == "practiceArea" && _id == $id && language == $language][0]{title}', {id: submission.practiceAreaId, language: submission.locale}) : null,
      submission.officeId ? client.fetch<{name?: string} | null>('*[_type == "office" && _id == $id && language == $language][0]{name}', {id: submission.officeId, language: submission.locale}) : null,
    ])
    if (submission.practiceAreaId && !practiceArea?.title) return error(locale, 400, 'practice_area', {practiceAreaId: locale === 'es' ? 'Seleccione un área de práctica válida.' : 'Select a valid practice area.'})
    if (submission.officeId && !office?.name) return error(locale, 400, 'office', {officeId: locale === 'es' ? 'Seleccione una oficina válida.' : 'Select a valid office.'})
    await deliverContactSubmission({...submission, practiceArea: practiceArea?.title, office: office?.name})
    completed.set(submission.submissionId, now)
    return NextResponse.json({ok: true})
  } catch (deliveryError) {
    if (deliveryError instanceof ContactDeliveryNotConfiguredError) return error(locale, 503, 'not_configured')
    return error(locale, 502, 'delivery_failed')
  }
}
