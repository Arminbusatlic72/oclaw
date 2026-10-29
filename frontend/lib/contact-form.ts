export type ContactFormMode = 'generalInquiry' | 'appointmentRequest'
export type ContactLocale = 'en' | 'es'

export type ContactSubmission = {
  submissionId: string
  startedAt: number
  website?: string
  locale: ContactLocale
  mode: ContactFormMode
  name: string
  email: string
  phone: string
  practiceAreaId?: string
  officeId?: string
  preferredDate?: string
  preferredTime?: string
  message: string
  privacyAccepted: boolean
}

export type ValidationResult = {ok: true; data: ContactSubmission} | {ok: false; errors: Record<string, string>}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

export function validateContactSubmission(value: unknown, now = Date.now()): ValidationResult {
  if (!value || typeof value !== 'object') return {ok: false, errors: {form: 'Invalid submission.'}}
  const input = value as Record<string, unknown>
  const locale: ContactLocale = input.locale === 'es' ? 'es' : 'en'
  const required = locale === 'es' ? 'Este campo es obligatorio.' : 'This field is required.'
  const errors: Record<string, string> = {}
  const mode = input.mode === 'appointmentRequest' ? 'appointmentRequest' : input.mode === 'generalInquiry' ? 'generalInquiry' : null
  const data: ContactSubmission = {
    submissionId: text(input.submissionId),
    startedAt: Number(input.startedAt),
    website: text(input.website),
    locale,
    mode: mode || 'generalInquiry',
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    phone: text(input.phone),
    practiceAreaId: text(input.practiceAreaId) || undefined,
    officeId: text(input.officeId) || undefined,
    preferredDate: text(input.preferredDate) || undefined,
    preferredTime: text(input.preferredTime) || undefined,
    message: text(input.message),
    privacyAccepted: input.privacyAccepted === true,
  }

  if (!/^[0-9a-f-]{36}$/i.test(data.submissionId)) errors.form = locale === 'es' ? 'Envío no válido.' : 'Invalid submission.'
  if (!Number.isFinite(data.startedAt) || now - data.startedAt < 2000 || now - data.startedAt > 7_200_000) errors.form = locale === 'es' ? 'Actualice la página e inténtelo de nuevo.' : 'Refresh the page and try again.'
  if (data.website) errors.form = locale === 'es' ? 'No se pudo enviar el formulario.' : 'The form could not be submitted.'
  if (!mode) errors.mode = required
  if (data.name.length < 2 || data.name.length > 120) errors.name = required
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = locale === 'es' ? 'Ingrese un correo electrónico válido.' : 'Enter a valid email address.'
  if (!/^[+()\d\s.-]{7,30}$/.test(data.phone)) errors.phone = locale === 'es' ? 'Ingrese un número de teléfono válido.' : 'Enter a valid phone number.'
  if (data.message.length < 10 || data.message.length > 5000) errors.message = locale === 'es' ? 'Escriba entre 10 y 5000 caracteres.' : 'Enter between 10 and 5000 characters.'
  if (!data.privacyAccepted) errors.privacyAccepted = required
  if (data.mode === 'generalInquiry' && !data.practiceAreaId) errors.practiceAreaId = required
  if (data.mode === 'appointmentRequest') {
    if (!data.officeId) errors.officeId = required
    if (!data.preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.preferredDate)) errors.preferredDate = required
    if (!data.preferredTime || !/^\d{2}:\d{2}$/.test(data.preferredTime)) errors.preferredTime = required
  }
  return Object.keys(errors).length ? {ok: false, errors} : {ok: true, data}
}
