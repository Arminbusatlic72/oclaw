import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {readFile, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {matchingDraft, metadataMatches, proposedDocument, translationEntry} from './practice-areas-migrate.mjs'

const root = new URL('../../migration/wordpress/', import.meta.url)
const load = async (name) => JSON.parse(await readFile(fileURLToPath(new URL(name, root)), 'utf8'))
const inventory = await load('practice-areas-inventory.json')
const plan = await load('practice-areas-dry-run.json')
const baseline = await load('backups/family-sponsorship-preimport-revisions.json')
const manifest = await load('family-sponsorship-import-manifest.json')
const pair = inventory.items.find((item) => item.english.wordpressId === 1067 && item.spanish.wordpressId === 2277)
assert.ok(pair)
assert.equal(plan.mode, 'apply')
assert.equal(plan.selectedPair, 'family-sponsorship')
assert.equal(manifest.status, 'applied')
assert.equal(manifest.published, false)
assert.equal(manifest.backupSha256, '03c2ad6736a53227c589ffcd24b87a53a92ebaca671ffa4b3550632cd7eef212')

const draftIds = ['drafts.practiceArea.wp.1067', 'drafts.practiceArea.wp.2277']
const metadataId = 'i18n.practiceArea.practiceArea.wp.1067'
const createdIds = [...draftIds, metadataId]
assert.deepEqual([...manifest.createdDocumentIds].sort(), [...createdIds].sort())
assert.deepEqual([...manifest.plannedCreates.map((item) => item.id)].sort(), [...createdIds].sort())

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-09-25', useCdn: false, perspective: 'raw',
  token: process.env.SANITY_API_READ_TOKEN,
})
assert.equal(manifest.projectId, 'ewrcmuk0')
assert.equal(manifest.dataset, 'production')
const all = await client.fetch('*[]{_id,_rev,_type}')
const byId = new Map(all.map((doc) => [doc._id, doc]))
const original = new Map(baseline.map((doc) => [doc._id, doc]))
const changedExisting = baseline.filter((doc) => byId.get(doc._id)?._rev !== doc._rev).map((doc) => doc._id)
const newIds = all.filter((doc) => !original.has(doc._id)).map((doc) => doc._id)
assert.deepEqual(changedExisting, [], 'An existing document changed after the baseline')
assert.deepEqual(newIds.sort(), [...createdIds].sort(), 'Unexpected documents were created')
assert.equal(byId.has('practiceArea.wp.1067'), false)
assert.equal(byId.has('practiceArea.wp.2277'), false)

const targets = await client.fetch('*[_id in $ids]', {ids: createdIds})
const targetById = new Map(targets.map((doc) => [doc._id, doc]))
assert.equal(targets.length, 3)
const records = [pair.english, pair.spanish]
const conversion = spawnSync('python3', [fileURLToPath(new URL('practice_areas_convert.py', root))], {
  input: JSON.stringify(records.map((record) => ({contentHtml: record.contentHtml}))),
  encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
})
assert.equal(conversion.status, 0, 'Portable Text conversion failed')
const converted = JSON.parse(conversion.stdout)
const details = records.map((record, index) => {
  const language = index === 0 ? 'en' : 'es'
  const id = draftIds[index]
  const stored = targetById.get(id)
  const finding = plan.findings.find((item) => item.wordpressId === record.wordpressId)
  assert.ok(stored)
  assert.ok(finding?.sourceVerified)
  assert.deepEqual(converted[index].issues, [])
  const expected = proposedDocument(record, language, 2, converted[index], finding.sourcePublishedAt)
  assert.equal(matchingDraft(stored, expected), true, `${id} differs from the verified source`)
  assert.deepEqual(stored.body, converted[index].body, `${id} Portable Text differs from conversion`)
  assert.equal(stored.seo.title, record.seo.title)
  assert.equal(stored.slug.current, record.slug)
  assert.equal(stored.sourcePublishedAt, finding.sourcePublishedAt)
  assert.equal(stored.language, language)
  assert.equal(stored.body.length, 23)
  assert.equal(record.url, `https://www.oclaw.us${language === 'en' ? '/practice-areas/' : '/es/areas-de-practica/'}${stored.slug.current}/`)
  return {wordpressId: record.wordpressId, draftId: id, language, url: record.url, slug: record.slug,
    sourcePublishedAt: stored.sourcePublishedAt, portableTextBlocks: stored.body.length,
    sourceWords: converted[index].sourceWordCount, portableTextMatchesSourceConversion: true,
    seoTitlePreserved: true}
})

const metadata = targetById.get(metadataId)
assert.ok(metadataMatches(metadata, 'practiceArea.wp.1067', 'practiceArea.wp.2277'))
assert.deepEqual(metadata.translations, [
  translationEntry('en', 'practiceArea.wp.1067'),
  translationEntry('es', 'practiceArea.wp.2277'),
])

const verification = {status: 'verified', projectId: 'ewrcmuk0', dataset: 'production',
  backupSha256: manifest.backupSha256, createdIds, publishedPracticeAreas: 0,
  existingDocumentsUnchanged: changedExisting.length === 0, unexpectedCreatedDocuments: 0,
  translationMetadataId: metadataId, translationRelationshipVerified: true, details,
  warnings: ['No source images or alt text', 'No source SEO descriptions', 'Editorial legal and translation review required before publication'],
}
const outputPath = fileURLToPath(new URL('family-sponsorship-import-verification.json', root))
await writeFile(outputPath, JSON.stringify(verification, null, 2) + '\n')
console.log(JSON.stringify({verification: outputPath, ...verification}, null, 2))
