import {NextRequest, NextResponse} from 'next/server'

import {validateContactSubmission} from '@/lib/contact-form'
import {ContactDeliveryNotConfiguredError, deliverContactSubmission} from '@/lib/contact-delivery'
import {MAX_CONTACT_REQUEST_BYTES, validateContactUploads} from '@/lib/contact-uploads'
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

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_CONTACT_REQUEST_BYTES) return error('en', 413, 'request_too_large', {documents: 'The combined upload is too large.'})

  let body: unknown
  let uploadedFiles: File[] = []
  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      uploadedFiles = formData.getAll('documents').filter((value): value is File => value instanceof File && value.size > 0)
      body = Object.fromEntries([...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
      ;(body as Record<string, unknown>).privacyAccepted = formData.get('privacyAccepted') === 'true' || formData.get('privacyAccepted') === 'on'
    } else if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      return error('en', 415, 'content_type')
    }
  } catch {
    return error('en', 400, 'invalid_request')
  }
  const locale = body && typeof body === 'object' && (body as {locale?: unknown}).locale === 'es' ? 'es' : 'en'
  const validated = validateContactSubmission(body, now)
  if (!validated.ok) return error(locale, 400, 'validation', validated.errors)
  const submission = validated.data
  const uploadsEnabled = process.env.CONTACT_FORM_UPLOADS_ENABLED === 'true'
  if (uploadedFiles.length && !uploadsEnabled) return error(locale, 503, 'uploads_not_configured', {documents: locale === 'es' ? 'La carga segura de documentos no está configurada.' : 'Secure document upload is not configured.'})
  const uploadValidation = await validateContactUploads(uploadedFiles, locale)
  if (!uploadValidation.ok) return error(locale, 400, 'documents', {documents: uploadValidation.message})
  const previous = completed.get(submission.submissionId)
  if (previous && previous > now - 24 * 60 * 60 * 1000) return NextResponse.json({ok: true, duplicate: true})

  try {
    const [practiceArea, localizedOffice] = await Promise.all([
      submission.practiceAreaId ? client.fetch<{title?: string} | null>('*[_type == "practiceArea" && _id == $id && language == $language][0]{title}', {id: submission.practiceAreaId, language: submission.locale}) : null,
      submission.officeId ? client.fetch<{name?: string} | null>('*[_type == "office" && _id == $id && language == $language][0]{name}', {id: submission.officeId, language: submission.locale}) : null,
    ])
    let office = localizedOffice
    if (submission.officeId && !office && submission.locale === 'es') {
      const spanishOfficeCount = await client.fetch<number>('count(*[_type == "office" && language == "es" && defined(slug.current)])')
      if (!spanishOfficeCount) office = await client.fetch<{name?: string} | null>('*[_type == "office" && _id == $id && coalesce(language, "en") == "en"][0]{name}', {id: submission.officeId})
    }
    if (submission.practiceAreaId && !practiceArea?.title) return error(locale, 400, 'practice_area', {practiceAreaId: locale === 'es' ? 'Seleccione un área de práctica válida.' : 'Select a valid practice area.'})
    if (submission.officeId && !office?.name) return error(locale, 400, 'office', {officeId: locale === 'es' ? 'Seleccione una oficina válida.' : 'Select a valid office.'})
    await deliverContactSubmission({...submission, practiceArea: practiceArea?.title, office: office?.name}, uploadValidation.files)
    completed.set(submission.submissionId, now)
    return NextResponse.json({ok: true})
  } catch (deliveryError) {
    if (deliveryError instanceof ContactDeliveryNotConfiguredError) return error(locale, 503, 'not_configured')
    return error(locale, 502, 'delivery_failed')
  }
}
