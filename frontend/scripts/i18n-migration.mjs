import {createHash} from 'node:crypto'
import {createClient} from '@sanity/client'

const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
if (!dataset || !projectId || !token) {
  throw new Error('Set project ID, dataset, and a Sanity token before running this script')
}

const apply = process.argv.includes('--apply')
const confirmation = process.argv.find((arg) => arg.startsWith('--confirm-dataset='))?.split('=')[1]
if (apply && (confirmation !== dataset || !process.env.SANITY_API_WRITE_TOKEN)) {
  throw new Error(
    'Applying requires SANITY_API_WRITE_TOKEN and --confirm-dataset=<configured dataset>',
  )
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-09-25',
  useCdn: false,
  perspective: 'raw',
})

const relevant = new Set(['page', 'settings', 'navigation', 'footer', 'translation.metadata'])
const all = (
  await client.fetch('*[]{_id,_type,_rev,language,slug,translations,schemaTypes}')
).filter((doc) => relevant.has(doc._type))
const allIds = new Map(all.map((doc) => [doc._id, doc]))
const byId = new Map(all.map((doc) => [doc._id, doc]))
const warnings = []
const errors = []
const operations = []
const baseId = (id) => id.replace(/^drafts\./, '')
const draftId = (id) => `drafts.${id}`
const reference = (language, id, type) => ({
  _key: createHash('sha256').update(`${language}:${id}`).digest('hex').slice(0, 12),
  _type: 'internationalizedArrayReferenceValue',
  language,
  value: {_type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: {type}},
})
const metadataId = (type, enId, esId) =>
  `i18n.${type}.${createHash('sha256').update(`${enId}:${esId}`).digest('hex').slice(0, 20)}`

for (const doc of all) {
  if (doc._type === 'translation.metadata') continue
  if (doc.language === 'es' || doc.language === 'en') continue
  if (doc.language) {
    errors.push(`Unsupported language on ${doc._id}: ${doc.language}`)
    continue
  }
  const id = baseId(doc._id)
  const isSpanishSingleton = ['siteSettings-es', 'siteNavigation-es', 'siteFooter-es'].includes(id)
  if (isSpanishSingleton) {
    operations.push({kind: 'language', id: doc._id, rev: doc._rev, language: 'es'})
  } else {
    operations.push({kind: 'language', id: doc._id, rev: doc._rev, language: 'en'})
  }
}

for (const [id, type, language] of [
  ['siteSettings', 'settings', 'en'],
  ['siteSettings-es', 'settings', 'es'],
  ['siteNavigation', 'navigation', 'en'],
  ['siteNavigation-es', 'navigation', 'es'],
  ['siteFooter', 'footer', 'en'],
  ['siteFooter-es', 'footer', 'es'],
]) {
  for (const candidate of [id, draftId(id)]) {
    const document = allIds.get(candidate)
    if (document && document._type !== type)
      errors.push(`Unexpected type for ${candidate}: ${document._type}`)
  }
  if (!byId.has(id) && !byId.has(draftId(id))) {
    warnings.push(`${id} is absent; plan a new unpublished draft`)
    operations.push({kind: 'createDraft', id: draftId(id), type, language})
  }
}

const pageVersions = all.filter((doc) => doc._type === 'page')
const slugOwners = new Map()
for (const page of pageVersions) {
  const language = page.language || 'en'
  const slug = page.slug?.current
  if (!slug) {
    warnings.push(`Page ${page._id} has no slug`)
    continue
  }
  if (['es', 'en', 'api', 'sitemap.xml', 'robots.txt'].includes(slug)) {
    errors.push(`Reserved slug: ${page._id} (${slug})`)
  }
  const key = `${language}:${slug}`
  const owner = slugOwners.get(key)
  if (owner && owner !== baseId(page._id)) errors.push(`Duplicate ${key}: ${owner}, ${page._id}`)
  slugOwners.set(key, baseId(page._id))
}

const metadata = all.filter((doc) => doc._type === 'translation.metadata')
const membership = new Map()
for (const doc of metadata) {
  const languages = new Set()
  for (const entry of doc.translations || []) {
    if (languages.has(entry.language))
      errors.push(`Duplicate language in ${doc._id}: ${entry.language}`)
    languages.add(entry.language)
    const ref = baseId(entry.value?._ref || '')
    if (!ref) {
      errors.push(`Missing reference in ${doc._id}`)
      continue
    }
    const existing = membership.get(ref)
    if (existing && existing !== doc._id)
      errors.push(`Document ${ref} belongs to multiple metadata documents`)
    membership.set(ref, doc._id)
  }
}

for (const [type, enId, esId] of [
  ['settings', 'siteSettings', 'siteSettings-es'],
  ['navigation', 'siteNavigation', 'siteNavigation-es'],
  ['footer', 'siteFooter', 'siteFooter-es'],
]) {
  const enMetadata = membership.get(enId)
  const esMetadata = membership.get(esId)
  if (enMetadata && esMetadata && enMetadata !== esMetadata) {
    errors.push(`Conflicting ${type} translation groups: ${enMetadata}, ${esMetadata}`)
    continue
  }
  const existing = byId.get(enMetadata || esMetadata)
  const translations = existing?.translations || []
  if (existing?.schemaTypes && !existing.schemaTypes.includes(type)) {
    errors.push(`Unexpected schemaTypes in ${existing._id}`)
  }
  for (const entry of translations) {
    const expected = entry.language === 'en' ? enId : esId
    if (entry.value?._ref && baseId(entry.value._ref) !== expected) {
      errors.push(`Unexpected ${entry.language} reference in ${existing._id}: ${entry.value._ref}`)
    }
  }
  const desired = [
    translations.find((entry) => entry.language === 'en') || reference('en', enId, type),
    translations.find((entry) => entry.language === 'es') || reference('es', esId, type),
  ]
  if (translations.some((entry) => !['en', 'es'].includes(entry.language))) {
    errors.push(`Unexpected locale in ${existing._id}`)
    continue
  }
  if (!existing) {
    operations.push({
      kind: 'metadata',
      id: metadataId(type, enId, esId),
      type,
      translations: desired,
    })
  } else if (translations.length !== 2) {
    operations.push({
      kind: 'metadataPatch',
      id: existing._id,
      rev: existing._rev,
      translations: desired,
    })
  }
}

const inventory = all.map((doc) => ({
  id: doc._id,
  type: doc._type,
  language: doc.language || null,
  slug: doc.slug?.current || null,
  draft: doc._id.startsWith('drafts.'),
  translations: doc.translations?.map((entry) => ({
    language: entry.language,
    ref: entry.value?._ref,
  })),
}))
console.log(
  JSON.stringify(
    {mode: apply ? 'apply' : 'dry-run', dataset, inventory, warnings, errors, operations},
    null,
    2,
  ),
)
if (errors.length) process.exit(1)
if (!apply) process.exit(0)

for (const operation of operations) {
  if (operation.kind === 'language') {
    await client
      .patch(operation.id)
      .ifRevisionId(operation.rev)
      .set({language: operation.language})
      .commit()
  } else if (operation.kind === 'createDraft') {
    await client.createIfNotExists({
      _id: operation.id,
      _type: operation.type,
      language: operation.language,
    })
  } else if (operation.kind === 'metadata') {
    await client.createIfNotExists({
      _id: operation.id,
      _type: 'translation.metadata',
      schemaTypes: [operation.type],
      translations: operation.translations,
    })
  } else if (operation.kind === 'metadataPatch') {
    await client
      .patch(operation.id)
      .ifRevisionId(operation.rev)
      .set({translations: operation.translations})
      .commit()
  }
}
console.log('Migration operations completed. Verify the dataset before publishing any document.')
