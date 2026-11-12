import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import ts from 'typescript'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {approvedCalendlyUrl, calendlyOptionsFromAction} from '../lib/calendly.ts'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../app/components/ContactAppointment.tsx', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX}})

async function render(link, locale = 'en', requestFormId = 'contact-form-test') {
  const calls = []
  const dependencies = {
    '@/app/components/ResolvedLink': ({link, children, ...props}) => React.createElement('button', {...props, 'data-action': link.linkType}, children),
    '@/lib/calendly': {approvedCalendlyUrl, calendlyOptionsFromAction},
    '@/lib/i18n': {navigationId: (locale) => locale === 'es' ? 'navigation-es' : 'navigation'},
    '@/sanity/lib/live': {sanityFetch: async (args) => {calls.push(args); return {data: {ctaLink: link}}}},
    '@/sanity/lib/queries': {navigationQuery: 'navigation-query'},
  }
  const compiled = {exports: {}}
  new Function('require', 'module', 'exports', outputText)((id) => dependencies[id] || require(id), compiled, compiled.exports)
  return {html: renderToStaticMarkup(await compiled.exports.default({locale, requestFormId})), calls}
}

test('approved booking action uses the shared link with decorative icons', async () => {
  const {html, calls} = await render({linkType: 'calendly', calendlyEventUrl: 'https://calendly.com/example/consultation'})
  assert.match(html, /data-action="calendly"/)
  assert.match(html, /Book an appointment/)
  assert.equal((html.match(/aria-hidden="true"/g) || []).length, 2)
  assert.doesNotMatch(html, /href="#/)
  assert.equal(calls[0].perspective, 'published')
})

test('missing or unsafe configuration offers a form request instead of confirmed booking', async () => {
  for (const link of [null, {linkType: 'href', href: 'https://example.com'}, {linkType: 'calendly', calendlyEventUrl: 'https://evil.example/event'}]) {
    const {html} = await render(link)
    assert.match(html, /href="#contact-form-test"/)
    assert.match(html, /Request an appointment/)
    assert.match(html, /confirm availability/)
    assert.doesNotMatch(html, /data-action="calendly"/)
  }
})

test('Spanish uses its own navigation action and translated request copy', async () => {
  const {html, calls} = await render(null, 'es')
  assert.equal(calls[0].params.id, 'navigation-es')
  assert.match(html, /Solicite una cita/)
  assert.doesNotMatch(html, /Request an appointment/)
})

test('no action is rendered without a booking URL or a form target', async () => {
  const {html} = await render(null, 'en', '')
  assert.equal(html, '')
})

test('Contact uses the configured Calendly fallback when navigation has no booking action', async () => {
  const previous = process.env.CONTACT_CALENDLY_EVENT_URL
  try {
    process.env.CONTACT_CALENDLY_EVENT_URL = 'https://calendly.com/dzarma-busatlic/30min'
    const {html} = await render(null)
    assert.match(html, /data-action="calendly"/)
    assert.doesNotMatch(html, /href="#/)
  } finally {
    if (previous === undefined) delete process.env.CONTACT_CALENDLY_EVENT_URL
    else process.env.CONTACT_CALENDLY_EVENT_URL = previous
  }
})
