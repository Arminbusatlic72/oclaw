/**
 * Read-only by default. Plans deterministic Sanity drafts and translation metadata
 * from the audited WordPress practice-area inventory. Never publishes areas.
 *
 * Dry run:
 *   node --env-file=.env.local scripts/practice-areas-migrate.mjs
 * Family Sponsorship test import:
 *   node --env-file=.env.local scripts/practice-areas-migrate.mjs --apply \
 *     --pair=family-sponsorship \
 *     --confirm-project=<project> --confirm-dataset=<dataset> \
 *     --confirm-inventory=<sha256 printed by dry run>
 * Remaining verified pairs (requires a new verified backup):
 *   node --env-file=.env.local scripts/practice-areas-migrate.mjs --apply \
 *     --remaining --backup-file=<archive basename> \
 *     --confirm-backup-sha=<sha256> --confirm-project=<project> \
 *     --confirm-dataset=<dataset> --confirm-inventory=<sha256>
 */
import {createHash} from 'node:crypto'
import {readFile, writeFile} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {basename, resolve} from 'node:path'
import {isDeepStrictEqual} from 'node:util'
import {createClient} from '@sanity/client'

const inventoryPath = fileURLToPath(new URL('../../migration/wordpress/practice-areas-inventory.json', import.meta.url))
const converterPath = fileURLToPath(new URL('../../migration/wordpress/practice_areas_convert.py', import.meta.url))
const reportPath = fileURLToPath(new URL('../../migration/wordpress/practice-areas-dry-run.json', import.meta.url))
const familyManifestPath = fileURLToPath(new URL('../../migration/wordpress/family-sponsorship-import-manifest.json', import.meta.url))
const batchManifestPath = fileURLToPath(new URL('../../migration/wordpress/remaining-practice-areas-import-manifest.json', import.meta.url))
const familyBackupPath = fileURLToPath(new URL('../../migration/wordpress/backups/sanity-production-2026-10-23T06-53-48-536Z.tar.gz', import.meta.url))
const familyBackupSha256 = '03c2ad6736a53227c589ffcd24b87a53a92ebaca671ffa4b3550632cd7eef212'
const backupDirectory = fileURLToPath(new URL('../../migration/wordpress/backups/', import.meta.url))
const collisionQuery = '*[_type in ["page", "blogPost", "practiceArea", "translation.metadata"]]{_id,_rev,_type,language,slug,title,body,sourcePublishedAt,displayOrder,featuredOnHomepage,seo,schemaTypes,translations}'
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const pairArg = args.find((arg) => arg.startsWith('--pair='))
const remaining = args.includes('--remaining')
const backupArg = args.find((arg) => arg.startsWith('--backup-file='))
const backupHashArg = args.find((arg) => arg.startsWith('--confirm-backup-sha='))
const backupFilename = backupArg?.slice('--backup-file='.length)
const confirmedBackupHash = backupHashArg?.slice('--confirm-backup-sha='.length)
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const sourceOrigin = 'https://www.oclaw.us'
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const baseId = (id) => id?.replace(/^drafts\./, '')
const pageId = (wordpressId) => `practiceArea.wp.${wordpressId}`
const metadataId = (englishId) => `i18n.practiceArea.${englishId}`
const cleanText = (html) => String(html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|hellip);/gi, (entity, code) => {
    const named = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…'}
    if (code[0] === '#') return String.fromCodePoint(code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10))
    return named[code.toLowerCase()] || entity
  })
  .replace(/\s+/g, ' ').trim()

function safeFailure(code) {
  // Sanity network errors can include request headers. Never print the error object.
  console.error(JSON.stringify({fatal: code}))
  process.exitCode = 1
}

function linkAlternates(source) {
  const result = {}
  for (const tag of source.match(/<link\b[^>]*>/gi) || []) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1]
    const language = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1]
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
    if (rel === 'alternate' && (language === 'en' || language === 'es') && href) result[language] = href.replaceAll('&amp;', '&')
  }
  return result
}

async function publicGet(url) {
  const response = await fetch(url, {headers: {'User-Agent': 'Oclaw-practice-area-readonly-audit/1.0'}, signal: AbortSignal.timeout(25000)})
  if (!response.ok) throw new Error('Public source request failed')
  return response.text()
}

async function mapConcurrent(values, task, concurrency = 4) {
  const output = Array(values.length)
  let next = 0
  await Promise.all(Array.from({length: Math.min(concurrency, values.length)}, async () => {
    while (next < values.length) {
      const index = next++
      output[index] = await task(values[index], index)
    }
  }))
  return output
}

function convertAll(records) {
  const input = records.map((record) => ({contentHtml: record.contentHtml}))
  const child = spawnSync('python3', [converterPath], {input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024})
  if (child.status !== 0) throw new Error('Portable Text conversion failed')
  const output = JSON.parse(child.stdout)
  if (output.length !== records.length) throw new Error('Portable Text conversion count mismatch')
  return output
}

export function proposedDocument(record, language, order, conversion, sourcePublishedAt) {
  const title = cleanText(record.title)
  return {
    _id: `drafts.${pageId(record.wordpressId)}`,
    _type: 'practiceArea',
    title,
    language,
    slug: {_type: 'slug', current: record.slug},
    body: conversion.body,
    ...(sourcePublishedAt ? {sourcePublishedAt} : {}),
    displayOrder: order,
    featuredOnHomepage: false,
    seo: {_type: 'seo', title: record.seo.title || undefined},
  }
}

export function matchingDraft(existing, wanted) {
  const fields = ['_type', 'title', 'language', 'slug', 'body', 'sourcePublishedAt', 'displayOrder', 'featuredOnHomepage', 'seo']
  return fields.every((field) => isDeepStrictEqual(existing[field] ?? null, wanted[field] ?? null))
}

export function translationEntry(language, id) {
  return {
    _key: sha256(`${language}:${id}`).slice(0, 12),
    _type: 'internationalizedArrayReferenceValue',
    language,
    value: {_type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: {type: 'practiceArea'}},
  }
}

export function metadataMatches(doc, enId, esId) {
  if (doc?._type !== 'translation.metadata' || doc.schemaTypes?.length !== 1 || doc.schemaTypes[0] !== 'practiceArea') return false
  const entries = doc.translations || []
  if (entries.length !== 2) return false
  return entries.some((entry) => entry.language === 'en' && baseId(entry.value?._ref) === enId) &&
    entries.some((entry) => entry.language === 'es' && baseId(entry.value?._ref) === esId)
}

async function main() {
  const raw = await readFile(inventoryPath, 'utf8')
  const inventoryHash = sha256(raw)
  const inventory = JSON.parse(raw)
  if (inventory.count !== 14 || inventory.items?.length !== 14) throw new Error('Unexpected inventory size')
  if (!projectId || !dataset) throw new Error('Missing Sanity project or dataset')
  const allowed = new Set(['--dry-run', '--apply', '--pair=family-sponsorship', '--remaining', `--confirm-project=${projectId}`, `--confirm-dataset=${dataset}`, `--confirm-inventory=${inventoryHash}`])
  if (backupArg) allowed.add(backupArg)
  if (backupHashArg) allowed.add(backupHashArg)
  if (args.some((arg) => !allowed.has(arg)) || (apply && args.includes('--dry-run')) || (remaining && pairArg)) throw new Error('Invalid mode or arguments')
  const selectedPair = inventory.items.find((pair) => pair.english.slug === 'family-sponsorship' && pair.english.wordpressId === 1067 && pair.spanish.wordpressId === 2277)
  if (!selectedPair || (apply && !remaining && pairArg !== '--pair=family-sponsorship')) throw new Error('Apply requires an explicit verified selection')
  if (remaining && apply && (!backupFilename || basename(backupFilename) !== backupFilename || !/^sanity-production-[\w-]+\.tar\.gz$/.test(backupFilename) || !/^[a-f0-9]{64}$/.test(confirmedBackupHash || ''))) throw new Error('Batch apply requires a verified backup filename and SHA-256')
  if (!remaining && (backupArg || backupHashArg)) throw new Error('Backup arguments are only valid for the remaining-pairs batch')
  if (apply && (!process.env.SANITY_API_WRITE_TOKEN || !args.includes(`--confirm-project=${projectId}`) || !args.includes(`--confirm-dataset=${dataset}`) || !args.includes(`--confirm-inventory=${inventoryHash}`))) throw new Error('Apply requires exact project, dataset, and inventory confirmations')

  const records = inventory.items.flatMap((pair) => [pair.english, pair.spanish])
  const conversions = convertAll(records)
  const source = JSON.parse(await publicGet(`${sourceOrigin}/wp-json/wp/v2/pages?per_page=100`))
  const apiById = new Map(source.map((record) => [record.id, record]))
  const pageHtml = await mapConcurrent(records, (record) => publicGet(record.url))
  const client = createClient({
    projectId, dataset, apiVersion: '2025-09-25', useCdn: false, perspective: 'raw',
    token: apply ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN,
  })
  const existing = await client.fetch(collisionQuery)
  const byId = new Map(existing.map((doc) => [doc._id, doc]))
  const findings = []
  const conflicts = []
  const actions = []
  const review = []
  const sourceChecks = new Map()

  for (let index = 0; index < records.length; index++) {
    const record = records[index]
    const live = apiById.get(record.wordpressId)
    const expectedParent = index % 2 === 0 ? 11 : 2181
    const title = cleanText(live?.title?.rendered)
    const expectedUrl = `${sourceOrigin}${index % 2 === 0 ? '/practice-areas/' : '/es/areas-de-practica/'}${record.slug}/`
    const contentMatches = live?.content?.rendered === record.contentHtml && live?.excerpt?.rendered === record.excerptHtml
    const identityMatches = live?.parent === expectedParent && live?.link === record.url && record.url === expectedUrl && live?.slug === record.slug && title === record.title
    const seoMatches = live?.yoast_head_json?.title === record.seo.title && (live?.yoast_head_json?.description || null) === (record.seo.description || null)
    const canonicalMatches = live?.yoast_head_json?.canonical === record.url && record.seo.canonical === record.url
    const imageCount = (live?.featured_media ? 1 : 0) + (live?.content?.rendered?.match(/<img\b/gi)?.length || 0) + (live?.yoast_head_json?.og_image?.length || 0)
    const imageMatches = imageCount === record.images.length && !record.featuredMediaId
    const conversion = conversions[index]
    const dateIsValid = !live?.date_gmt || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(live.date_gmt)
    const sourcePublishedAt = live?.date_gmt && dateIsValid ? `${live.date_gmt}Z` : undefined
    const sourceOk = Boolean(contentMatches && identityMatches && seoMatches && canonicalMatches && imageMatches && dateIsValid && !conversion.issues.length)
    sourceChecks.set(record.wordpressId, sourceOk)
    const language = index % 2 === 0 ? 'en' : 'es'
    const wanted = proposedDocument(record, language, Math.floor(index / 2) + 1, conversion, sourcePublishedAt)
    const base = pageId(record.wordpressId)
    const published = byId.get(base)
    const draft = byId.get(`drafts.${base}`)
    const owner = existing.filter((doc) => doc._type === 'practiceArea' && doc.language === language && doc.slug?.current === record.slug && baseId(doc._id) !== base)
    if (owner.length) conflicts.push({wordpressId: record.wordpressId, issue: 'practice-area slug is already owned by another Sanity document', owners: owner.map((doc) => doc._id)})
    if (published && (published._type !== 'practiceArea' || published.language !== language || published.slug?.current !== record.slug || published.title !== wanted.title)) conflicts.push({wordpressId: record.wordpressId, issue: 'stable published ID has unexpected identity; manual review required'})
    if (draft && !published && !matchingDraft(draft, wanted)) conflicts.push({wordpressId: record.wordpressId, issue: 'stable draft ID has differing content; manual review required'})
    if (!draft && !published) actions.push({kind: 'draft', document: wanted})
    if (!sourceOk) conflicts.push({wordpressId: record.wordpressId, issue: 'source snapshot, canonical, image inventory, or conversion mismatch'})
    if (!record.seo.description) review.push({wordpressId: record.wordpressId, issue: 'Yoast meta description missing'})
    if (/(&hellip;|\[\s*…\s*\])/i.test(record.excerptHtml)) review.push({wordpressId: record.wordpressId, issue: 'WordPress excerpt is truncated; write a reviewed short description'})
    if (!record.images.length && !record.featuredMediaId) review.push({wordpressId: record.wordpressId, issue: 'no source image or alt text for the requested card and hero design'})
    if (/847-258-9954|info@oclaw\.us/i.test(record.contentHtml)) review.push({wordpressId: record.wordpressId, issue: 'embedded contact details should be checked against office records before publication'})
    if (/•/.test(record.contentHtml)) review.push({wordpressId: record.wordpressId, issue: 'hand-typed bullet lines were converted to list items; verify their boundaries'})
    review.push({wordpressId: record.wordpressId, issue: 'immigration-law content needs current legal and translation review before publication'})
    findings.push({wordpressId: record.wordpressId, language, url: record.url, slug: record.slug, sourcePublishedAt, sourceVerified: sourceOk, portableTextBlocks: conversion.body.length, sourceWords: conversion.sourceWordCount, conversionIssues: conversion.issues, images: record.images.length, hasSeoTitle: Boolean(record.seo.title), hasSeoDescription: Boolean(record.seo.description), canonicalMatches, existingDraft: Boolean(draft), existingPublished: Boolean(published)})
  }

  for (const [index, pair] of inventory.items.entries()) {
    const en = pair.english
    const es = pair.spanish
    const enLinks = linkAlternates(pageHtml[index * 2])
    const esLinks = linkAlternates(pageHtml[index * 2 + 1])
    const verified = enLinks.en === en.url && enLinks.es === es.url && esLinks.en === en.url && esLinks.es === es.url
    pair._verified = verified
    if (!verified) conflicts.push({englishId: en.wordpressId, spanishId: es.wordpressId, issue: 'WordPress hreflang pair is missing or nonreciprocal'})
    const enId = pageId(en.wordpressId)
    const esId = pageId(es.wordpressId)
    const members = existing.filter((doc) => doc._type === 'translation.metadata' && (doc.translations || []).some((entry) => [enId, esId].includes(baseId(entry.value?._ref))))
    const desiredId = metadataId(enId)
    const occupied = byId.get(desiredId)
    if (members.length > 1 || (members.length === 1 && !metadataMatches(members[0], enId, esId)) || (occupied && !members.includes(occupied))) {
      conflicts.push({englishId: en.wordpressId, spanishId: es.wordpressId, issue: 'translation metadata membership or deterministic ID conflict'})
    } else if (verified && sourceChecks.get(en.wordpressId) && sourceChecks.get(es.wordpressId) && members.length === 0) {
      actions.push({kind: 'metadata', document: {_id: desiredId, _type: 'translation.metadata', schemaTypes: ['practiceArea'], translations: [translationEntry('en', enId), translationEntry('es', esId)]}})
    }
  }

  for (const [language, slug] of [['en', 'practice-areas'], ['es', 'areas-de-practica']]) {
    const owners = existing.filter((doc) => ['page', 'blogPost'].includes(doc._type) && (doc.language || 'en') === language && doc.slug?.current === slug)
    if (owners.length) conflicts.push({route: language === 'en' ? '/practice-areas/' : '/es/areas-de-practica/', issue: 'archive route is occupied by a Sanity page or post', owners: owners.map((doc) => doc._id)})
  }

  const verifiedPairs = inventory.items.filter((pair) => pair._verified).length
  const selectedPairs = remaining ? inventory.items.filter((pair) => pair !== selectedPair) : pairArg ? [selectedPair] : inventory.items
  const belongsToPair = (issue, pair) => [pair.english.wordpressId, pair.spanish.wordpressId].some((id) => [issue.wordpressId, issue.englishId, issue.spanishId].includes(id))
  const skippedPairs = []
  const eligiblePairs = []
  for (const pair of selectedPairs) {
    const enId = pageId(pair.english.wordpressId)
    const esId = pageId(pair.spanish.wordpressId)
    const ids = [enId, esId, metadataId(enId)]
    const reasons = conflicts.filter((issue) => belongsToPair(issue, pair)).map((issue) => issue.issue)
    if (ids.some((id) => byId.has(id) || byId.has(`drafts.${id}`))) reasons.push('a selected stable ID already exists; existing documents are never overwritten')
    if (actions.filter((action) => ids.includes(baseId(action.document._id))).length !== 3) reasons.push('pair does not plan exactly two drafts and one metadata document')
    if (reasons.length) skippedPairs.push({englishId: pair.english.wordpressId, spanishId: pair.spanish.wordpressId, reasons: [...new Set(reasons)]})
    else eligiblePairs.push(pair)
  }
  const selectedIds = new Set(eligiblePairs.flatMap((pair) => {
    const enId = pageId(pair.english.wordpressId)
    return [enId, pageId(pair.spanish.wordpressId), metadataId(enId)]
  }))
  const stagedActions = actions.filter((action) => selectedIds.has(baseId(action.document._id)))
  const globalConflicts = conflicts.filter((issue) => !selectedPairs.some((pair) => belongsToPair(issue, pair)))
  const safe = remaining ? !globalConflicts.length : !conflicts.length && verifiedPairs === 14
  const report = {
    mode: apply ? 'apply' : 'dry-run', selection: remaining ? 'remaining-13' : pairArg ? 'family-sponsorship' : 'all', projectId, dataset, inventorySha256: inventoryHash,
    source: `${sourceOrigin}/wp-json/wp/v2/pages?per_page=100`,
    counts: {
      records: findings.length,
      pairs: inventory.items.length,
      verifiedPairs,
      eligibleForDraftStaging: safe ? stagedActions.filter((item) => item.kind === 'draft').length : 0,
      selectedPairs: selectedPairs.length,
      skippedPairs: skippedPairs.length,
      urlConflicts: conflicts.filter((item) => /route|slug/.test(item.issue)).length,
      blockingConflicts: conflicts.length,
      unsupportedContent: findings.filter((item) => item.conversionIssues.length).length,
      recordsWithoutSourceImages: findings.filter((item) => item.images === 0).length,
      recordsMissingSeoDescriptions: findings.filter((item) => !item.hasSeoDescription).length,
      proposedDraftCreates: stagedActions.filter((item) => item.kind === 'draft').length,
      proposedMetadataCreates: stagedActions.filter((item) => item.kind === 'metadata').length,
    },
    findings, translationPairs: inventory.items.map((pair) => ({englishId: pair.english.wordpressId, englishUrl: pair.english.url, spanishId: pair.spanish.wordpressId, spanishUrl: pair.spanish.url, verified: pair._verified})),
    conflicts, skippedPairs, editorialReview: review,
    readiness: safe ? 'ready for guarded draft staging; editorial review is required before publication' : 'blocked pending source or collision review',
  }
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({mode: report.mode, projectId, dataset, inventorySha256: inventoryHash, counts: report.counts, readiness: report.readiness, report: reportPath}, null, 2))
  if (!safe) {process.exitCode = 1; return}
  if (!apply) return

  const manifestPath = remaining ? batchManifestPath : familyManifestPath
  const backupPath = remaining ? resolve(backupDirectory, backupFilename) : familyBackupPath
  const backupSha256 = remaining ? confirmedBackupHash : familyBackupSha256
  if (sha256(await readFile(backupPath)) !== backupSha256) throw new Error('Verified production backup is missing or changed')
  if (remaining) {
    const familyManifest = JSON.parse(await readFile(familyManifestPath, 'utf8'))
    if (familyManifest.status !== 'applied' || familyManifest.createdDocumentIds?.length !== 3) throw new Error('Family Sponsorship import manifest is invalid')
    if (!byId.has(pageId(1067)) || !byId.has(pageId(2277)) || !metadataMatches(byId.get(metadataId(pageId(1067))), pageId(1067), pageId(2277))) throw new Error('Published Family Sponsorship pair is missing or unlinked')
    if (byId.has(`drafts.${pageId(1067)}`) || byId.has(`drafts.${pageId(2277)}`)) throw new Error('Family Sponsorship has an unreviewed draft')
  }
  let priorManifest
  try { priorManifest = JSON.parse(await readFile(manifestPath, 'utf8')) } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  if (priorManifest) {
    if (priorManifest.status === 'applied' && stagedActions.length === 0) {
      console.log(JSON.stringify({alreadyApplied: true, manifest: manifestPath, published: false}))
      return
    }
    throw new Error('Existing import manifest requires review before retry')
  }
  if (!eligiblePairs.length || stagedActions.length !== eligiblePairs.length * 3 || stagedActions.filter((action) => action.kind === 'draft').length !== eligiblePairs.length * 2 || stagedActions.filter((action) => action.kind === 'metadata').length !== eligiblePairs.length) throw new Error('Selected pairs do not plan exactly two drafts and one translation metadata document each')
  // Abort if another editor changed any relevant document after the preflight read.
  const latest = await client.fetch(collisionQuery)
  const snapshot = (documents) => sha256(JSON.stringify([...documents].sort((a, b) => a._id.localeCompare(b._id))))
  if (snapshot(existing) !== snapshot(latest)) throw new Error('Sanity changed during preflight')
  const manifest = {projectId, dataset, inventorySha256: inventoryHash, backupSha256, selection: remaining ? 'remaining-13' : 'family-sponsorship', status: 'pending', skippedPairs, plannedCreates: stagedActions.map(({kind, document}) => ({kind, id: document._id})), createdDocumentIds: [], published: false}
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', {mode: 0o600})
  const transaction = client.transaction()
  for (const action of stagedActions) transaction.create(action.document)
  if (stagedActions.length) await transaction.commit()
  manifest.status = 'applied'
  manifest.createdDocumentIds = stagedActions.map(({document}) => document._id)
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', {mode: 0o600})
  console.log(JSON.stringify({applied: true, draftsCreated: report.counts.proposedDraftCreates, metadataCreated: report.counts.proposedMetadataCreates, published: false}))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {await main()} catch {safeFailure('Migration stopped or completion is uncertain; inspect the manifest and Sanity before retrying')}
}
