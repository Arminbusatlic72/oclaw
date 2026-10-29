import type {ContactSubmission} from './contact-form'

export class ContactDeliveryNotConfiguredError extends Error {}

export type ContactDeliveryPayload = ContactSubmission & {
  practiceArea?: string
  office?: string
}

export async function deliverContactSubmission(payload: ContactDeliveryPayload) {
  const endpoint = process.env.CONTACT_FORM_WEBHOOK_URL
  const token = process.env.CONTACT_FORM_WEBHOOK_TOKEN
  if (!endpoint || !token) throw new ContactDeliveryNotConfiguredError('Contact delivery is not configured.')
  const url = new URL(endpoint)
  if (url.protocol !== 'https:') throw new ContactDeliveryNotConfiguredError('Contact delivery must use HTTPS.')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': payload.submissionId,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error('Contact delivery failed.')
}
