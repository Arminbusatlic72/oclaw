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
const baseline = await load('backups/remaining-practice-areas-preimport-revisions.json')
const manifest = await load('remaining-practice-areas-import-manifest.json')
const familyManifest = await load('family-sponsorship-import-manifest.json')
const pairs = inventory.items.filter((pair) => pair.english.wordpressId !== 1067)
assert.equal(pairs.length, 13)
assert.equal(plan.mode, 'apply')
assert.equal(plan.selection, 'remaining-13')
assert.equal(plan.counts.skippedPairs, 0)
assert.equal(plan.counts.blockingConflicts, 0)
assert.equal(manifest.status, 'applied')
assert.equal(manifest.selection, 'remaining-13')
assert.equal(manifest.published, false)
assert.deepEqual(manifest.skippedPairs, [])
assert.equal(manifest.backupSha256, '3883c5a9dec44bbb4a3f391241d77a6ce67a8c20d424810ac4d3c3d51b91cfb7')
assert.equal(familyManifest.status, 'applied')

const draftIds = pairs.flatMap((pair) => [pair.english, pair.spanish].map((record) => `drafts.practiceArea.wp.${record.wordpressId}`))
const metadataIds = pairs.map((pair) => `i18n.practiceArea.practiceArea.wp.${pair.english.wordpressId}`)
const createdIds = [...draftIds, ...metadataIds]
assert.equal(createdIds.length, 39)
assert.deepEqual([...manifest.createdDocumentIds].sort(), [...createdIds].sort())
assert.deepEqual(manifest.plannedCreates.map((item) => item.id).sort(), [...createdIds].sort())

const client = createClient({projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2025-09-25',
  useCdn: false, perspective: 'raw', token: process.env.SANITY_API_READ_TOKEN})
assert.equal(manifest.projectId, 'ewrcmuk0')
assert.equal(manifest.dataset, 'production')
const all = await client.fetch('*[]{_id,_rev,_type}')
const byId = new Map(all.map((doc) => [doc._id, doc]))
const original = new Map(baseline.map((doc) => [doc._id, doc]))
const changedExisting = baseline.filter((doc) => byId.get(doc._id)?._rev !== doc._rev).map((doc) => doc._id)
const newIds = all.filter((doc) => !original.has(doc._id)).map((doc) => doc._id)
assert.deepEqual(changedExisting, [], 'A pre-existing document revision changed')
assert.deepEqual(newIds.sort(), [...createdIds].sort(), 'Unexpected document creation')
for (const pair of pairs) {
  assert.equal(byId.has(`practiceArea.wp.${pair.english.wordpressId}`), false)
  assert.equal(byId.has(`practiceArea.wp.${pair.spanish.wordpressId}`), false)
}
for (const id of ['practiceArea.wp.1067', 'practiceArea.wp.2277', 'i18n.practiceArea.practiceArea.wp.1067']) assert.ok(byId.has(id))

const targets = await client.fetch('*[_id in $ids]', {ids: createdIds})
assert.equal(targets.length, 39)
const targetById = new Map(targets.map((doc) => [doc._id, doc]))
const records = pairs.flatMap((pair) => [pair.english, pair.spanish])
const conversion = spawnSync('python3', [fileURLToPath(new URL('practice_areas_convert.py', root))], {
  input: JSON.stringify(records.map((record) => ({contentHtml: record.contentHtml}))),
  encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
})
assert.equal(conversion.status, 0, 'Portable Text conversion failed')
const converted = JSON.parse(conversion.stdout)
const details = records.map((record, index) => {
  const pair = pairs[Math.floor(index / 2)]
  const order = inventory.items.indexOf(pair) + 1
  const language = index % 2 === 0 ? 'en' : 'es'
  const id = `drafts.practiceArea.wp.${record.wordpressId}`
  const stored = targetById.get(id)
  const finding = plan.findings.find((item) => item.wordpressId === record.wordpressId)
  assert.ok(stored)
  assert.ok(finding?.sourceVerified)
  assert.deepEqual(converted[index].issues, [])
  const expected = proposedDocument(record, language, order, converted[index], finding.sourcePublishedAt)
  assert.equal(matchingDraft(stored, expected), true, `${id} differs from the verified source`)
  assert.deepEqual(stored.body, converted[index].body, `${id} Portable Text differs from conversion`)
  assert.equal(stored.seo.title, record.seo.title)
  assert.equal(stored.slug.current, record.slug)
  assert.equal(stored.sourcePublishedAt, finding.sourcePublishedAt)
  assert.equal(stored.language, language)
  assert.equal(record.url, `https://www.oclaw.us${language === 'en' ? '/practice-areas/' : '/es/areas-de-practica/'}${stored.slug.current}/`)
  return {wordpressId: record.wordpressId, draftId: id, language, title: record.title,
    url: record.url, sourcePublishedAt: stored.sourcePublishedAt,
    portableTextBlocks: stored.body.length, sourceWords: converted[index].sourceWordCount,
    seoTitlePreserved: true, portableTextMatchesSourceConversion: true}
})
for (const pair of pairs) {
  const enId = `practiceArea.wp.${pair.english.wordpressId}`
  const esId = `practiceArea.wp.${pair.spanish.wordpressId}`
  const doc = targetById.get(`i18n.practiceArea.${enId}`)
  assert.ok(metadataMatches(doc, enId, esId))
  assert.deepEqual(doc.translations, [translationEntry('en', enId), translationEntry('es', esId)])
}

const published = client.withConfig({perspective: 'published'})
const publicAreas = await published.fetch('*[_type == "practiceArea"]{_id,language,"slug":slug.current,featuredOnHomepage}')
assert.deepEqual(publicAreas.map((item) => item._id).sort(), ['practiceArea.wp.1067', 'practiceArea.wp.2277'])
assert.equal(publicAreas.every((item) => item.featuredOnHomepage === true), true)
const translationQuery = '*[_type == "translation.metadata" && references($id)][0].translations[]{language,"target":value->{_id,_type,language,"slug":slug.current}}'
const familyTranslations = await published.fetch(translationQuery, {id: 'practiceArea.wp.1067'})
assert.deepEqual(familyTranslations.map((item) => item.target?._id).sort(), ['practiceArea.wp.1067', 'practiceArea.wp.2277'])
const unpublishedTranslations = await published.fetch(translationQuery, {id: 'practiceArea.wp.1061'})
assert.equal(unpublishedTranslations.every((item) => item.target === null), true)

const selectedWordpressIds = new Set(records.map((record) => record.wordpressId))
const editorialReview = plan.editorialReview.filter((issue) => selectedWordpressIds.has(issue.wordpressId))
const verification = {status: 'verified', projectId: 'ewrcmuk0', dataset: 'production',
  backupSha256: manifest.backupSha256, englishDrafts: 13, spanishDrafts: 13,
  translationMetadataCreated: 13, createdIds, publishedNewPracticeAreas: 0,
  unchangedExistingDocuments: baseline.length, unexpectedCreatedDocuments: 0,
  publicPracticeAreas: publicAreas.map((item) => item._id),
  publishedFamilyLanguageSwitchVerified: true,
  draftOnlyAreasExcludedFromPublicQueries: true,
  skippedPairs: [], details, editorialReview,
}
const outputPath = fileURLToPath(new URL('remaining-practice-areas-import-verification.json', root))
await writeFile(outputPath, JSON.stringify(verification, null, 2) + '\n')
console.log(JSON.stringify({verification: outputPath, status: verification.status,
  englishDrafts: verification.englishDrafts, spanishDrafts: verification.spanishDrafts,
  translationMetadataCreated: verification.translationMetadataCreated,
  unchangedExistingDocuments: verification.unchangedExistingDocuments,
  unexpectedCreatedDocuments: verification.unexpectedCreatedDocuments,
  publishedNewPracticeAreas: verification.publishedNewPracticeAreas,
  portableTextBlocks: details.reduce((sum, item) => sum + item.portableTextBlocks, 0),
  editorialIssues: editorialReview.length}, null, 2))
