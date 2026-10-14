import {createClient} from '@sanity/client'

const ENGLISH_ID = 'b6c94469-f8ea-405c-b0b1-c7b9cacbd5a2'
const SPANISH_ID = '9765a4db-9c9d-4150-bcdc-37add9a35ec9'
const METADATA_ID = `i18n.page.${ENGLISH_ID}`
const PAIR = `${ENGLISH_ID}:${SPANISH_ID}`

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const dryRun = args.includes('--dry-run') || !apply
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25'

function fail(message) {
  throw new Error(message)
}

if (args.some((arg) => ![
  '--apply',
  '--dry-run',
  `--confirm-project=${projectId}`,
  `--confirm-dataset=${dataset}`,
  `--confirm-pair=${PAIR}`,
].includes(arg))) {
  fail('Unknown or incorrect argument')
}
if (apply && dryRun) fail('Use either --apply or --dry-run')
if (!projectId || !dataset) fail('Sanity project ID and dataset are required')
if (apply && (
  !process.env.SANITY_API_WRITE_TOKEN ||
  !args.includes(`--confirm-project=${projectId}`) ||
  !args.includes(`--confirm-dataset=${dataset}`) ||
  !args.includes(`--confirm-pair=${PAIR}`)
)) {
  fail('Apply requires SANITY_API_WRITE_TOKEN and exact project, dataset, and pair confirmations')
}

const token = apply ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN
const client = createClient({projectId, dataset, apiVersion, token, useCdn: false, perspective: 'raw'})

const normalizeRef = (ref) => ref?.replace(/^drafts\./, '')
const expectedRefs = new Set([ENGLISH_ID, SPANISH_ID])
const referencesPair = (metadata) => metadata.translations?.some((entry) =>
  expectedRefs.has(normalizeRef(entry?.value?._ref)),
)
const isExactMetadata = (metadata) =>
  metadata._id === METADATA_ID &&
  metadata.schemaTypes?.length === 1 &&
  metadata.schemaTypes[0] === 'page' &&
  metadata.translations?.length === 2 &&
  metadata.translations.every((entry) =>
    entry?._type === 'internationalizedArrayReferenceValue' &&
    entry?.value?._type === 'reference' &&
    entry?.value?._weak !== true &&
    ((entry.language === 'en' && entry.value._ref === ENGLISH_ID) ||
      (entry.language === 'es' && entry.value._ref === SPANISH_ID)),
  ) &&
  new Set(metadata.translations.map((entry) => entry.language)).size === 2

const metadataDocument = {
  _id: METADATA_ID,
  _type: 'translation.metadata',
  schemaTypes: ['page'],
  translations: [
    {
      _key: `en-${ENGLISH_ID.slice(0, 8)}`,
      _type: 'internationalizedArrayReferenceValue',
      language: 'en',
      value: {_type: 'reference', _ref: ENGLISH_ID},
    },
    {
      _key: `es-${SPANISH_ID.slice(0, 8)}`,
      _type: 'internationalizedArrayReferenceValue',
      language: 'es',
      value: {_type: 'reference', _ref: SPANISH_ID},
    },
  ],
}

try {
  const ids = [ENGLISH_ID, `drafts.${ENGLISH_ID}`, SPANISH_ID, `drafts.${SPANISH_ID}`]
  const [documents, metadata] = await Promise.all([
    client.getDocuments(ids),
    client.fetch('*[_type == "translation.metadata"]{_id, _rev, schemaTypes, translations}'),
  ])
  const [english, englishDraft, spanish, spanishDraft] = documents
  const conflicts = []

  if (!english || english._type !== 'page' || english.slug?.current !== 'about-us') {
    conflicts.push('English published page is missing, is not a page, or has an unexpected slug')
  }
  if (!spanish || spanish._type !== 'page' || spanish.slug?.current !== 'sobre-nosotros') {
    conflicts.push('Spanish published page is missing, is not a page, or has an unexpected slug')
  }
  if (englishDraft || spanishDraft) conflicts.push('A draft exists for one of the About pages')
  if (english && english.language != null && english.language !== 'en') {
    conflicts.push(`English page has unexpected language ${JSON.stringify(english.language)}`)
  }
  if (spanish && spanish.language !== 'es') {
    conflicts.push(`Spanish page has unexpected language ${JSON.stringify(spanish.language)}`)
  }

  const relatedMetadata = metadata.filter(referencesPair)
  const idCollision = metadata.find((doc) => doc._id === METADATA_ID)
  if (relatedMetadata.length > 1) conflicts.push('More than one metadata document references this pair')
  if (relatedMetadata.length === 1 && !isExactMetadata(relatedMetadata[0])) {
    conflicts.push(`Existing metadata ${relatedMetadata[0]._id} needs manual review`)
  }
  if (idCollision && !relatedMetadata.includes(idCollision)) {
    conflicts.push(`Metadata ID ${METADATA_ID} is already occupied`)
  }

  const metadataExists = relatedMetadata.length === 1 && isExactMetadata(relatedMetadata[0])
  const mutations = []
  if (!conflicts.length) {
    if (english.language == null) {
      mutations.push({operation: 'patch', id: ENGLISH_ID, ifRevisionId: english._rev, set: {language: 'en'}})
    }
    if (!metadataExists) mutations.push({operation: 'create', document: metadataDocument})
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    projectId,
    dataset,
    documents: [english, englishDraft, spanish, spanishDraft].map((doc, index) => ({
      requestedId: ids[index],
      exists: !!doc,
      type: doc?._type,
      slug: doc?.slug?.current,
      language: doc?.language ?? null,
      revision: doc?._rev,
    })),
    relatedMetadataIds: relatedMetadata.map((doc) => doc._id),
    conflicts,
    proposedMutations: mutations,
  }, null, 2))

  if (conflicts.length) process.exitCode = 1
  else if (apply && mutations.length) {
    const transaction = client.transaction()
    if (english.language == null) {
      transaction.patch(client.patch(ENGLISH_ID).ifRevisionId(english._rev).set({language: 'en'}))
    }
    if (!metadataExists) transaction.create(metadataDocument)
    const result = await transaction.commit()
    console.log(JSON.stringify({applied: true, transactionId: result.transactionId}))
  } else if (apply) console.log(JSON.stringify({applied: false, reason: 'Already repaired'}))
} catch (error) {
  console.error(JSON.stringify({error: error.response?.body?.error?.description || error.code || error.message}))
  process.exitCode = 1
}
