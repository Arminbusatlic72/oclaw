import assert from 'node:assert/strict'
import test from 'node:test'

import {
  absoluteUrl,
  englishCanonicalPath,
  localePath,
  safeLegacyUrl,
  settingsId,
  navigationId,
  footerId,
  mapContentLinks,
  linkedTranslationPaths,
} from '../lib/i18n.ts'

test('English and Spanish routes use independent slugs and trailing slashes', () => {
  assert.equal(localePath('en'), '/')
  assert.equal(localePath('es'), '/es/')
  assert.equal(localePath('en', 'about-us'), '/about-us/')
  assert.equal(localePath('es', 'sobre-nosotros'), '/es/sobre-nosotros/')
  assert.equal(
    absoluteUrl(localePath('es', 'sobre-nosotros')),
    'https://www.oclaw.us/es/sobre-nosotros/',
  )
})

test('/en paths have one canonical unprefixed destination', () => {
  assert.equal(englishCanonicalPath('/en'), '/')
  assert.equal(englishCanonicalPath('/en/'), '/')
  assert.equal(englishCanonicalPath('/en/about-us/'), '/about-us/')
  assert.equal(englishCanonicalPath('/english/'), null)
  const url = new URL('https://www.oclaw.us/en/about-us/?campaign=1')
  url.pathname = englishCanonicalPath(url.pathname)
  assert.equal(url.toString(), 'https://www.oclaw.us/about-us/?campaign=1')
})

test('localized singleton IDs stay distinct', () => {
  assert.equal(settingsId('en'), 'siteSettings')
  assert.equal(settingsId('es'), 'siteSettings-es')
  assert.equal(navigationId('en'), 'siteNavigation')
  assert.equal(navigationId('es'), 'siteNavigation-es')
  assert.equal(footerId('en'), 'siteFooter')
  assert.equal(footerId('es'), 'siteFooter-es')
})

test('legacy links cannot cross languages accidentally', () => {
  assert.equal(safeLegacyUrl('/', 'es'), '/es/')
  assert.equal(safeLegacyUrl('/about-us/', 'es'), null)
  assert.equal(safeLegacyUrl('/es/sobre-nosotros/', 'en'), null)
  assert.equal(safeLegacyUrl('/about-us/', 'en'), '/about-us/')
  assert.equal(safeLegacyUrl('/en/about-us?campaign=1', 'en'), '/about-us/?campaign=1')
  assert.equal(safeLegacyUrl('https://example.com/', 'es'), 'https://example.com/')
  assert.equal(safeLegacyUrl('javascript:alert(1)', 'en'), null)
})

test('all six blocks retain fields and resolve nested page references', async () => {
  const link = {
    _type: 'link',
    linkType: 'page',
    page: {_id: 'about-en', language: 'en', slug: 'about-us'},
  }
  const blocks = [
    {
      _type: 'heroSlider',
      slides: [{_key: 's', title: 'Hola', cta: {label: 'Leer', url: '/about-us/', link}}],
    },
    {
      _type: 'cardGrid',
      cards: [{_key: 'c', title: 'Tarjeta', cta: {label: 'Leer', url: '/about-us/', link}}],
    },
    {_type: 'processSteps', steps: [{_key: 'p', title: 'Paso'}], button: {link}},
    {
      _type: 'parallaxFeatures',
      features: [{_key: 'f', title: 'Función', cta: {label: 'Leer', url: '/about-us/', link}}],
    },
    {_type: 'callToAction', heading: 'Llamada', button: {link}},
    {_type: 'infoSection', content: [{_type: 'block', markDefs: [link]}]},
  ]
  const resolved = await mapContentLinks(blocks, 'es', async (target) =>
    target._id === 'about-en' ? '/es/sobre-nosotros/' : null,
  )
  assert.deepEqual(
    resolved.map((block) => block._type),
    blocks.map((block) => block._type),
  )
  assert.equal(resolved[0].slides[0].cta.url, '/es/sobre-nosotros/')
  assert.equal(resolved[1].cards[0].cta.url, '/es/sobre-nosotros/')
  assert.equal(resolved[2].button.link.page, '/es/sobre-nosotros/')
  assert.equal(resolved[3].features[0].cta.url, '/es/sobre-nosotros/')
  assert.equal(resolved[4].button.link.page, '/es/sobre-nosotros/')
  assert.equal(resolved[5].content[0].markDefs[0].page, '/es/sobre-nosotros/')
  assert.equal(resolved[0].slides[0].title, 'Hola')
  assert.equal(blocks[0].slides[0].cta.url, '/about-us/')
})

test('unpublished or missing translation removes reference links', async () => {
  const block = {
    _type: 'cardGrid',
    cards: [
      {
        cta: {
          label: 'Read',
          url: '/about-us/',
          link: {_type: 'link', linkType: 'page', page: {_id: 'missing'}},
        },
      },
    ],
  }
  const resolved = await mapContentLinks(block, 'es', async () => null)
  assert.equal(resolved.cards[0].cta.url, null)
  assert.equal(resolved.cards[0].cta.link.page, null)
})

test('linked translations use their own published slugs and reject missing targets', () => {
  const entries = [
    {language: 'en', page: {_id: 'about-en', language: null, slug: 'about-us'}},
    {language: 'es', page: {_id: 'about-es', language: 'es', slug: 'sobre-nosotros'}},
  ]
  assert.deepEqual(linkedTranslationPaths('en', 'about-us', entries), {
    en: '/about-us/',
    es: '/es/sobre-nosotros/',
  })
  assert.deepEqual(linkedTranslationPaths('en', 'about-us', [{language: 'es', page: null}]), {
    en: '/about-us/',
  })
  assert.deepEqual(
    linkedTranslationPaths('en', 'about-us', [
      {
        language: 'es',
        page: {_id: 'about-es', language: 'es', slug: 'sobre-nosotros', noIndex: true},
      },
    ]),
    {en: '/about-us/'},
  )
})

test('home translation alternates require matching localized homepage settings', () => {
  const entries = [{language: 'es', page: {_id: 'home-es', language: 'es', slug: 'inicio'}}]
  assert.deepEqual(linkedTranslationPaths('en', null, entries, {es: 'home-es'}, true), {
    en: '/',
    es: '/es/',
  })
  assert.deepEqual(linkedTranslationPaths('en', null, entries, {es: 'other-page'}, true), {
    en: '/',
  })
})
