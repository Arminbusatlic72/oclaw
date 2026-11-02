import type {ContactSubmission} from './contact-form'
import type {ContactUpload} from './contact-uploads'

export class ContactDeliveryNotConfiguredError extends Error {}

export type ContactDeliveryPayload = ContactSubmission & {
  practiceArea?: string
  office?: string
}

export async function deliverContactSubmission(payload: ContactDeliveryPayload, documents: ContactUpload[] = []) {
  const endpoint = process.env.CONTACT_FORM_WEBHOOK_URL
  const token = process.env.CONTACT_FORM_WEBHOOK_TOKEN
  if (!endpoint || !token) throw new ContactDeliveryNotConfiguredError('Contact delivery is not configured.')
  const url = new URL(endpoint)
  if (url.protocol !== 'https:') throw new ContactDeliveryNotConfiguredError('Contact delivery must use HTTPS.')

  const body = documents.length ? new FormData() : JSON.stringify(payload)
  if (body instanceof FormData) {
    body.set('submission', JSON.stringify(payload))
    for (const document of documents) body.append('documents', document.file, document.safeName)
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${token}`,
      ...(!documents.length && {'content-type': 'application/json'}),
      'idempotency-key': payload.submissionId,
    },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error('Contact delivery failed.')
}
