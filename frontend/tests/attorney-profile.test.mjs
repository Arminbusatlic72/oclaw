import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import ts from 'typescript'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {PortableText} from '@portabletext/react'
import {collectionPath} from '../lib/collection-routing.ts'
import {postPath} from '../lib/blog-routing.ts'
import {calendlyOptionsFromAction} from '../lib/calendly.ts'

const require = createRequire(import.meta.url)
const dependencies = {
  'next/link': ({children, ...props}) => React.createElement('a', props, children),
  'next-sanity': {PortableText, defineQuery: (query) => query},
  '@/app/components/SanityImage': ({id, alt}) =>
    React.createElement('img', {'data-image': id, alt}),
  '@/lib/collection-routing': {collectionPath},
  '@/lib/blog-routing': {postPath},
  '@/lib/calendly': {calendlyOptionsFromAction},
  '@/lib/i18n': {absoluteUrl: (path) => `https://example.com${path}`},
  '@/sanity/lib/utils': {linkResolver: (link) => link.href},
  '@/components/ui/button': {Button: ({children}) => children, buttonVariants: () => ''},
}
const cache = new Map()
function component(path) {
  if (cache.has(path)) return cache.get(path)
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  })
  const compiled = {exports: {}}
  new Function('require', 'module', 'exports', outputText)(
    (id) => {
      if (dependencies[id]) return dependencies[id]
      if (id.startsWith('@/')) return component(`${id.slice(2)}.tsx`)
      return require(id)
    },
    compiled,
    compiled.exports,
  )
  cache.set(path, compiled.exports)
  return compiled.exports
}
const queries = component('sanity/lib/queries.ts')
dependencies['@/sanity/lib/queries'] = queries
const Profile = component('app/components/collections/AttorneyProfile.tsx').default
const Card = component('app/components/collections/AttorneyCard.tsx').default
const blocks = (text) => [
  {
    _type: 'block',
    _key: 'body',
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: 'text', marks: ['strong'], text}],
  },
]
const render = (person, locale = 'en', bookingAction) =>
  renderToStaticMarkup(
    React.createElement(Profile, {
      person: {_id: locale, fullName: 'Test Attorney', ...person},
      locale,
      slug: 'test',
      bookingAction,
    }),
  )

test('published biography edits remain visible when personal experience is populated', () => {
  const person = {
    professionalTitle: 'Updated Title',
    shortBiography: 'Updated short biography',
    biography: blocks('Updated full biography'),
    experience: blocks('Separate personal experience'),
  }
  const html = render(person)
  for (const text of [
    'Updated Title',
    'Updated short biography',
    '<strong>Updated full biography</strong>',
    'Separate personal experience',
    '>Overview</h2>',
  ])
    assert.ok(html.includes(text), text)
  const updated = render({
    ...person,
    shortBiography: 'Next short biography',
    biography: blocks('Next full biography'),
  })
  assert.ok(updated.includes('Next short biography'))
  assert.ok(updated.includes('Next full biography'))
  assert.ok(!updated.includes('Updated full biography'))
})

test('empty sections are omitted and Spanish content stays independent', () => {
  const html = render(
    {shortBiography: 'Resumen español', biography: blocks('Biografía publicada')},
    'es',
  )
  assert.ok(html.includes('Resumen español'))
  assert.ok(html.includes('>Descripción general</h2>'))
  assert.ok(!html.includes('Personal Experience'))
  assert.ok(!html.includes('Experiencia personal'))
  assert.ok(!html.includes('Updated full biography'))
  const empty = render({})
  for (const id of [
    'overview',
    'memberships',
    'insights',
    'services',
    'education',
    'admissions',
    'experience',
    'skills',
    'achievements',
    'certificates',
    'languages',
  ])
    assert.ok(!empty.includes(`id="${id}"`), id)
})

test('structured and legacy credentials, memberships and relationships are retained', () => {
  // Synthetic fixtures are never written to Sanity.
  const html = render(
    {
      education: ['Legacy education fixture'],
      educationDetails: [
        {
          _key: 'school',
          institution: 'Institution fixture',
          degree: 'Degree fixture',
          graduationYear: 2001,
          description: 'Education description',
        },
      ],
      barAdmissions: ['Legacy admission fixture'],
      admissions: [
        {
          _key: 'bar',
          jurisdiction: 'Jurisdiction fixture',
          bar: 'Court fixture',
          year: 2002,
          description: 'Admission description',
        },
      ],
      professionalMemberships: ['Organization fixture'],
      offices: [{_id: 'office', name: 'Office fixture', slug: 'office-fixture'}],
      practiceAreas: [{_id: 'practice', title: 'Practice fixture', slug: 'practice-fixture'}],
      phone: '+1 (555) 000-0000',
      email: 'fixture@example.com',
    },
    'es',
  )
  for (const text of [
    'Legacy education fixture',
    'Institution fixture',
    'Degree fixture, 2001',
    'Education description',
    'Legacy admission fixture',
    'Jurisdiction fixture',
    'Court fixture, 2002',
    'Admission description',
    'Organization fixture',
    '/es/oficinas/office-fixture/',
    '/es/areas-de-practica/practice-fixture/',
    'mailto:fixture@example.com',
    'tel:+15550000000',
    '>Admisiones</h2>',
  ])
    assert.ok(html.includes(text), text)
})

test('resources group approved links and hide unavailable references and unsafe URLs', () => {
  const html = render(
    {
      insights: [
        {
          _key: 's',
          category: 'speaking',
          title: 'Speaking fixture',
          url: 'https://example.com/event',
          date: '2025-01-02',
        },
        {
          _key: 'b',
          category: 'blog',
          hasPost: true,
          post: {title: 'Blog fixture', slug: 'blog-fixture', publishedAt: '2025-01-03T00:00:00Z'},
        },
        {_key: 'n', category: 'news', title: 'News fixture', url: 'https://example.com/news'},
        {
          _key: 'missing',
          category: 'blog',
          hasPost: true,
          post: null,
          title: 'Unpublished fixture',
          url: 'https://example.com/should-not-render',
        },
        {_key: 'bad', category: 'news', title: 'Unsafe fixture', url: 'javascript:alert(1)'},
      ],
    },
    'es',
  )
  for (const text of [
    '>Conferencias</h3>',
    '>Artículos del blog</h3>',
    '>Noticias del bufete</h3>',
    'Speaking fixture',
    'href="/es/blog-fixture/"',
    'dateTime="2025-01-02"',
  ])
    assert.ok(html.includes(text), text)
  assert.ok(!html.includes('Unpublished fixture'))
  assert.ok(!html.includes('Unsafe fixture'))
  assert.ok(!html.includes('should-not-render'))
})

test('consultation uses the shared popup and disables unapproved or missing URLs', () => {
  const approved = {
    _type: 'link',
    linkType: 'calendly',
    calendlyEventUrl: 'https://calendly.com/fixture/consultation',
  }
  const html = render({}, 'en', approved)
  assert.match(html, /<button[^>]*aria-haspopup="dialog"[^>]*>Schedule a Consultation<\/button>/)
  assert.ok(!html.includes('<iframe'))
  const override = render({consultationLink: approved}, 'es')
  assert.match(override, /<button[^>]*aria-haspopup="dialog"[^>]*>Programar una consulta<\/button>/)
  for (const action of [undefined, {...approved, calendlyEventUrl: 'https://example.com/unsafe'}]) {
    assert.match(
      render({}, 'en', action),
      /<span[^>]*aria-disabled="true">Schedule a Consultation<\/span>/,
    )
  }
})

test('cards and the About Us showcase display the Sanity short biography', async () => {
  const person = {
    _id: 'card',
    fullName: 'Card fixture',
    slug: 'card-fixture',
    professionalTitle: 'Title fixture',
    shortBiography: 'Updated card summary',
  }
  const html = renderToStaticMarkup(React.createElement(Card, {person, locale: 'es'}))
  assert.ok(html.includes('Updated card summary'))
  assert.ok(html.includes('/es/abogados/card-fixture/'))
  dependencies['@/sanity/lib/live'] = {
    sanityFetch: async ({query, params, perspective}) => {
      assert.equal(query, queries.attorneyListQuery)
      assert.equal(params.language, 'es')
      assert.equal(perspective, 'published')
      return {data: [person]}
    },
  }
  const Showcase = component('app/components/blocks/AttorneysSection.tsx').default
  const about = renderToStaticMarkup(await Showcase({block: {heading: 'Equipo'}, locale: 'es'}))
  assert.ok(about.includes('Updated card summary'))
  assert.ok(about.includes('Title fixture'))
})

// Sanity already supplies the GROQ evaluator used here; no extra runtime dependency.
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js')
const query = async (groq, dataset, params) =>
  (await evaluate(parse(groq), {dataset, params})).get()

test('GROQ keeps localized biographies, dereferences relationships and excludes unavailable insights', async () => {
  const dataset = [
    {
      _id: 'en',
      _type: 'attorney',
      language: 'en',
      fullName: 'English fixture',
      slug: {current: 'profile'},
      professionalTitle: 'Title fixture',
      shortBiography: 'English summary',
      biography: blocks('English biography'),
      practiceAreas: [{_ref: 'practice-en'}, {_ref: 'practice-es'}, {_ref: 'deleted'}],
      offices: [{_ref: 'office-en'}, {_ref: 'office-es'}],
      insights: [
        {_key: 'published', category: 'blog', post: {_ref: 'post-en'}},
        {_key: 'other-language', category: 'blog', post: {_ref: 'post-es'}},
        {_key: 'future', category: 'news', post: {_ref: 'post-future'}},
        {_key: 'draft', category: 'blog', post: {_ref: 'post-draft'}},
      ],
    },
    {
      _id: 'es',
      _type: 'attorney',
      language: 'es',
      fullName: 'Spanish fixture',
      slug: {current: 'profile'},
      shortBiography: 'Resumen español',
      biography: blocks('Biografía española'),
    },
    {
      _id: 'practice-en',
      _type: 'practiceArea',
      language: 'en',
      title: 'Practice EN',
      slug: {current: 'practice-en'},
    },
    {
      _id: 'practice-es',
      _type: 'practiceArea',
      language: 'es',
      title: 'Practice ES',
      slug: {current: 'practice-es'},
    },
    {
      _id: 'office-en',
      _type: 'office',
      language: 'en',
      name: 'Office EN',
      slug: {current: 'office-en'},
    },
    {
      _id: 'office-es',
      _type: 'office',
      language: 'es',
      name: 'Office ES',
      slug: {current: 'office-es'},
    },
    {
      _id: 'post-en',
      _type: 'blogPost',
      language: 'en',
      title: 'Published fixture',
      slug: {current: 'post-en'},
      publishedAt: '2020-01-01T00:00:00Z',
    },
    {
      _id: 'post-es',
      _type: 'blogPost',
      language: 'es',
      title: 'Spanish fixture',
      slug: {current: 'post-es'},
      publishedAt: '2020-01-01T00:00:00Z',
    },
    {
      _id: 'post-future',
      _type: 'blogPost',
      language: 'en',
      title: 'Scheduled fixture',
      slug: {current: 'post-future'},
      publishedAt: '2999-01-01T00:00:00Z',
    },
  ]
  const params = {language: 'en', slug: 'profile'}
  const en = await query(queries.attorneyQuery, dataset, params)
  assert.equal(en.shortBiography, 'English summary')
  assert.deepEqual(en.biography, blocks('English biography'))
  assert.deepEqual(
    en.practiceAreas.map((p) => p._id),
    ['practice-en'],
  )
  assert.deepEqual(
    en.offices.map((o) => o._id),
    ['office-en'],
  )
  assert.equal(en.insights[0].post._id, 'post-en')
  for (const item of en.insights.slice(1)) assert.equal(item.post, null)
  assert.deepEqual(
    (
      await query(queries.attorneysForPracticeQuery, dataset, {language: 'en', id: 'practice-en'})
    ).map((p) => p._id),
    ['en'],
  )
  assert.deepEqual(
    (await query(queries.attorneysForOfficeQuery, dataset, {language: 'en', id: 'office-en'})).map(
      (p) => p._id,
    ),
    ['en'],
  )
  const es = await query(queries.attorneyQuery, dataset, {...params, language: 'es'})
  assert.equal(es.shortBiography, 'Resumen español')
  assert.deepEqual(es.biography, blocks('Biografía española'))
  dataset[0].shortBiography = 'New published summary'
  dataset[0].biography = blocks('New published biography')
  const changed = await query(queries.attorneyQuery, dataset, params)
  assert.equal(changed.shortBiography, 'New published summary')
  assert.deepEqual(changed.biography, blocks('New published biography'))
})
