import assert from 'node:assert/strict'
import {createHmac} from 'node:crypto'
import test from 'node:test'

import {parseBody} from 'next-sanity/webhook'

import {
  createRevalidationHandler,
  createRevalidationPlan,
  SANITY_CACHE_TAG,
  type SanityRevalidationPayload,
} from '../lib/sanity-revalidation.ts'

const secret = 'test-only-revalidation-secret'

function signature(body: string) {
  const timestamp = Date.now()
  const digest = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('base64url')
  return `t=${timestamp},v1=${digest}`
}

function signedRequest(payload: SanityRevalidationPayload, overrideSignature?: string) {
  const body = JSON.stringify(payload)
  return new Request('https://www.oclaw.us/api/revalidate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'sanity-webhook-signature': overrideSignature ?? signature(body),
    },
    body,
  })
}

function harness() {
  const paths: Array<[string, 'layout' | 'page' | undefined]> = []
  const tags: Array<[string, 'max']> = []
  const handler = createRevalidationHandler({
    secret,
    parseBody: (request, webhookSecret) =>
      parseBody(request as never, webhookSecret, false),
    revalidatePath: (path, type) => paths.push([path, type]),
    revalidateTag: (tag, profile) => tags.push([tag, profile]),
  })
  return {handler, paths, tags}
}

test('accepts a valid Sanity signature and invalidates localized attorney dependencies', async () => {
  const {handler, paths, tags} = harness()
  const response = await handler(
    signedRequest({
      operation: 'update',
      before: {
        _id: 'attorney-1',
        _type: 'attorney',
        language: 'es',
        slug: 'nombre-anterior',
        practiceAreas: [
          {_id: 'area-1', _type: 'practiceArea', language: 'es', slug: 'inmigracion'},
        ],
      },
      after: {
        _id: 'attorney-1',
        _type: 'attorney',
        language: 'es',
        slug: 'nombre-nuevo',
        offices: [{_id: 'office-1', _type: 'office', language: 'es', slug: 'chicago'}],
      },
    }),
  )

  assert.equal(response.status, 200)
  assert.deepEqual(tags, [[SANITY_CACHE_TAG, 'max']])
  const invalidated = paths.map(([path]) => path)
  assert.ok(invalidated.includes('/es/abogados/nombre-anterior/'))
  assert.ok(invalidated.includes('/es/abogados/nombre-nuevo/'))
  assert.ok(invalidated.includes('/es/areas-de-practica/inmigracion/'))
  assert.ok(invalidated.includes('/es/oficinas/chicago/'))
  assert.ok(invalidated.includes('/es/sobre-nosotros/'))
  assert.ok(invalidated.includes('/es/'))
})

test('rejects missing and invalid signatures without invalidating caches', async () => {
  for (const request of [
    new Request('https://www.oclaw.us/api/revalidate', {
      method: 'POST',
      body: JSON.stringify({operation: 'create'}),
    }),
    signedRequest(
      {operation: 'create', after: {_id: 'page-1', _type: 'page', language: 'en'}},
      't=1700000000000,v1=invalid',
    ),
  ]) {
    const {handler, paths, tags} = harness()
    const response = await handler(request)
    assert.equal(response.status, 401)
    assert.deepEqual(paths, [])
    assert.deepEqual(tags, [])
  }
})

test('delete and unpublish payloads invalidate the old localized route', () => {
  const plan = createRevalidationPlan({
    operation: 'delete',
    before: {
      _id: 'post-es',
      _type: 'blogPost',
      language: 'es',
      slug: 'noticia-anterior',
    },
    after: null,
  })

  assert.equal(plan?.operation, 'delete')
  assert.ok(plan?.paths.includes('/es/noticia-anterior/'))
  assert.ok(plan?.paths.includes('/es/blog-espanol/'))
  assert.ok(plan?.paths.includes('/sitemap.xml'))
})

test('navigation, footer and settings changes invalidate the shared root layout', () => {
  for (const documentType of ['navigation', 'footer', 'settings'] as const) {
    const plan = createRevalidationPlan({
      operation: 'update',
      before: {_id: `${documentType}-es`, _type: documentType, language: 'es'},
      after: {_id: `${documentType}-es`, _type: documentType, language: 'es'},
    })
    assert.equal(plan?.revalidateLayout, true)
  }
})

test('translation metadata invalidates every projected English and Spanish target', () => {
  const plan = createRevalidationPlan({
    operation: 'update',
    before: {
      _id: 'i18n.about',
      _type: 'translation.metadata',
      translations: [
        {_id: 'about-en', _type: 'page', language: 'en', slug: 'about-us'},
        {_id: 'about-es', _type: 'page', language: 'es', slug: 'sobre-nosotros'},
      ],
    },
    after: {
      _id: 'i18n.about',
      _type: 'translation.metadata',
      translations: [
        {_id: 'about-en', _type: 'page', language: 'en', slug: 'our-firm'},
        {_id: 'about-es', _type: 'page', language: 'es', slug: 'nuestro-bufete'},
      ],
    },
  })

  assert.deepEqual(plan?.paths, [
    '/about-us/',
    '/es/nuestro-bufete/',
    '/es/sobre-nosotros/',
    '/our-firm/',
    '/sitemap.xml',
  ])
})
