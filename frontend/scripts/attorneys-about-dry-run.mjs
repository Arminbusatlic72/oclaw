/** Read-only source and collision audit. Never creates attorney documents. */
import {readFile, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const inventoryPath = fileURLToPath(new URL('../../migration/wordpress/attorneys-about-inventory.json', import.meta.url))
const reportPath = fileURLToPath(new URL('../../migration/wordpress/attorneys-about-dry-run.json', import.meta.url))
const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const sourcePages = {}
for (const [locale, source] of Object.entries(inventory.sourcePages)) {
  const slug = new URL(source.url).pathname.split('/').filter(Boolean).at(-1)
  const response = await fetch(`https://www.oclaw.us/wp-json/wp/v2/pages?slug=${slug}`, {signal: AbortSignal.timeout(25000)})
  if (!response.ok) throw new Error(`WordPress ${locale} source is unavailable`)
  const records = await response.json()
  const page = records.find((item) => item.id === source.wordpressId)
  if (!page) throw new Error(`WordPress ${locale} source ID changed`)
  sourcePages[locale] = page
}

const client = createClient({projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2025-09-25',
  useCdn: false, perspective: 'raw', token: process.env.SANITY_API_READ_TOKEN})
const existing = await client.fetch('*[_type in ["attorney", "page", "blogPost", "practiceArea", "office", "translation.metadata"]]{_id,_type,language,fullName,slug,translations}')
const issues = []
const pageChecks = Object.entries(inventory.sourcePages).map(([locale, source]) => {
  const page = sourcePages[locale]
  const valid = page.link === source.url && page.yoast_head_json?.canonical === source.url && page.yoast_head_json?.title === source.seoTitle
  if (!valid) issues.push({locale, issue: 'WordPress About URL, canonical or SEO title changed'})
  return {locale, wordpressId: page.id, url: page.link, canonical: page.yoast_head_json?.canonical, seoTitle: page.yoast_head_json?.title, verified: valid}
})

const reserved = new Set(['attorneys', 'abogados', 'practice-areas', 'areas-de-practica', 'offices', 'oficinas', 'about-us', 'sobre-nosotros', 'blog', 'blog-espanol'])
const proposedPairs = inventory.attorneys.map((person) => {
  const sourceVerified = ['en', 'es'].every((locale) => {
    const html = sourcePages[locale].content.rendered
    return html.includes(person.name) && html.includes(person.titles[locale]) && html.includes(person.portrait.sourceUrl)
  })
  if (!sourceVerified) issues.push({name: person.name, issue: 'Name, role or portrait is missing from a source page'})
  if (reserved.has(person.proposedSlug)) issues.push({name: person.name, issue: 'Proposed slug is reserved'})
  const owners = existing.filter((doc) => doc._type === 'attorney' && (doc.fullName === person.name || doc.slug?.current === person.proposedSlug))
  if (owners.length) issues.push({name: person.name, issue: 'Potential existing Sanity attorney record', owners: owners.map((doc) => doc._id)})
  const crossCollectionSameSlug = existing.filter((doc) => ['page', 'blogPost', 'practiceArea', 'office'].includes(doc._type) && doc.slug?.current === person.proposedSlug).map((doc) => ({id: doc._id, type: doc._type}))
  return {name: person.name, proposedSlug: person.proposedSlug, sourceVerified,
    proposedDraftIds: ['en', 'es'].map((locale) => `drafts.attorney.about.${person.proposedSlug}.${locale}`),
    proposedMetadataId: `i18n.attorney.about.${person.proposedSlug}`,
    sourceTitles: person.titles, portrait: person.portrait,
    crossCollectionSameSlug, practiceAreaAssignments: [], officeAssignments: [],
    biographyAvailable: false, educationAvailable: false, barAdmissionsAvailable: false,
    editorialFlags: person.editorialFlags}
})

const report = {mode: 'dry-run', projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, productionWrites: 0,
  counts: {sourcePages: 2, sourcePeople: inventory.attorneys.length,
    proposedBilingualPairs: proposedPairs.length, proposedDrafts: proposedPairs.length * 2,
    existingSanityAttorneys: existing.filter((doc) => doc._type === 'attorney').length,
    blockingSourceOrSlugIssues: issues.length},
  pageChecks, proposedPairs, issues,
  readiness: issues.length ? 'blocked by source or slug issues' : 'source verified; editorial approval, portrait asset staging and separate import authorization required'}
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({report: reportPath, counts: report.counts, readiness: report.readiness}, null, 2))
