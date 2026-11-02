import assert from 'node:assert/strict'
import test from 'node:test'

import {MAX_CONTACT_FILE_BYTES, validateContactUploads} from '../lib/contact-uploads.ts'

test('accepts a PDF whose content matches its extension', async () => {
  const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])], 'case notes.pdf', {type: 'application/pdf'})
  const result = await validateContactUploads([file], 'en')
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.files[0].safeName, 'case-notes.pdf')
})

test('rejects a renamed executable', async () => {
  const file = new File(['not really a pdf'], 'unsafe.pdf', {type: 'application/pdf'})
  const result = await validateContactUploads([file], 'en')
  assert.equal(result.ok, false)
})

test('rejects files larger than the per-file limit', async () => {
  const file = new File([new Uint8Array(MAX_CONTACT_FILE_BYTES + 1)], 'large.pdf', {type: 'application/pdf'})
  const result = await validateContactUploads([file], 'es')
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.message, /15 MB/)
})
