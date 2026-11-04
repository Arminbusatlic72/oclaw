import assert from 'node:assert/strict'
import test from 'node:test'

import {approvedCalendlyUrl} from '../lib/calendly.ts'

test('accepts canonical HTTPS Calendly event URLs', () => {
  assert.equal(
    approvedCalendlyUrl('https://calendly.com/example-team/consultation'),
    'https://calendly.com/example-team/consultation',
  )
  assert.equal(
    approvedCalendlyUrl('https://www.calendly.com/example-team/consultation'),
    'https://www.calendly.com/example-team/consultation',
  )
})

test('rejects unapproved, incomplete, or parameterized URLs', () => {
  assert.equal(approvedCalendlyUrl('https://example.com/calendly.com/event'), null)
  assert.equal(approvedCalendlyUrl('http://calendly.com/example/event'), null)
  assert.equal(approvedCalendlyUrl('https://evil.calendly.com/example/event'), null)
  assert.equal(approvedCalendlyUrl('https://calendly.com/example'), null)
  assert.equal(approvedCalendlyUrl('https://calendly.com/example/event?name=Client'), null)
  assert.equal(approvedCalendlyUrl('https://calendly.com/example/event#details'), null)
})
