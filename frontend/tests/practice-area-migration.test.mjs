import test from 'node:test'
import assert from 'node:assert/strict'
import {matchingDraft, metadataMatches, proposedDocument, translationEntry} from '../scripts/practice-areas-migrate.mjs'

const source = {wordpressId: 1067, title: 'Family Sponsorship', slug: 'family-sponsorship', seo: {title: 'Family Sponsorship - OC Law Group'}}
const conversion = {body: [{_type: 'block', _key: 'k000001', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 'k000002', text: 'Body', marks: []}]}]}

test('draft IDs and content are stable on rerun; changed editorial content is never overwritten', () => {
  const wanted = proposedDocument(source, 'en', 2, conversion, '2020-05-02T10:29:53Z')
  assert.equal(wanted._id, 'drafts.practiceArea.wp.1067')
  assert.equal(wanted.sourcePublishedAt, '2020-05-02T10:29:53Z')
  assert.equal(matchingDraft({...wanted, _rev: 'revision'}, wanted), true)
  assert.equal(matchingDraft({...wanted, title: 'Edited title'}, wanted), false)
  assert.equal(matchingDraft({...wanted, sourcePublishedAt: '2024-01-01T00:00:00Z'}, wanted), false)
})

test('translation metadata matches only its exact practice-area pair', () => {
  const en = 'practiceArea.wp.1067'
  const es = 'practiceArea.wp.2277'
  const metadata = {_type: 'translation.metadata', schemaTypes: ['practiceArea'], translations: [translationEntry('en', en), translationEntry('es', es)]}
  assert.equal(metadataMatches(metadata, en, es), true)
  assert.equal(metadataMatches(metadata, en, 'practiceArea.wp.9999'), false)
  assert.equal(metadata.translations[0].value._weak, true)
  assert.deepEqual(metadata.translations[0].value._strengthenOnPublish, {type: 'practiceArea'})
})
