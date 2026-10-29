import assert from 'node:assert/strict'
import test from 'node:test'

import {validateContactSubmission} from '../lib/contact-form.ts'

const now = Date.UTC(2026, 9, 28, 12)
const base = {
  submissionId: '123e4567-e89b-12d3-a456-426614174000',
  startedAt: now - 5000,
  locale: 'en',
  mode: 'generalInquiry',
  name: 'Jane Client',
  email: 'jane@example.com',
  phone: '+1 312 555 0123',
  practiceAreaId: 'practice-1',
  message: 'I would like to discuss my legal matter.',
  privacyAccepted: true,
}

test('accepts a valid general inquiry', () => {
  const result = validateContactSubmission(base, now)
  assert.equal(result.ok, true)
})

test('requires appointment preferences and an office', () => {
  const result = validateContactSubmission({...base, mode: 'appointmentRequest', practiceAreaId: undefined}, now)
  assert.equal(result.ok, false)
  if (!result.ok) assert.deepEqual(Object.keys(result.errors).sort(), ['officeId', 'preferredDate', 'preferredTime'])
})

test('rejects honeypot and too-fast submissions', () => {
  const result = validateContactSubmission({...base, website: 'spam.example', startedAt: now - 200}, now)
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.form)
})

test('returns localized validation messages', () => {
  const result = validateContactSubmission({...base, locale: 'es', email: 'invalid'}, now)
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.errors.email, /correo electrónico/)
})
