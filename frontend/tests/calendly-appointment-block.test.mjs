import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import ts from 'typescript'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {calendlyOptionsFromAction} from '../lib/calendly.ts'

const require = createRequire(import.meta.url)
function load(file, dependencies) {
  const source = readFileSync(new URL(`../app/components/blocks/${file}.tsx`, import.meta.url), 'utf8')
  const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX}})
  const compiled = {exports: {}}
  new Function('require', 'module', 'exports', outputText)((id) => dependencies[id] || require(id), compiled, compiled.exports)
  return compiled.exports.default
}
const Client = load('CalendlyBookingClient', {
  '@/components/ui/button': {Button: ({children, ...props}) => React.createElement('button', props, children), buttonVariants: () => 'standard-button'},
})
const Block = load('CalendlyBooking', {
  '@/lib/calendly': {calendlyOptionsFromAction},
  '@/app/components/blocks/CalendlyBookingClient': {default: Client, __esModule: true},
})
const block = {heading: 'Book an appointment', description: 'Choose a time.', displayMode: 'appointment', eventUrl: 'https://calendly.com/example/consultation', buttonLabel: 'Reserve your time'}

test('appointment block uses its own URL and the existing Radix popup trigger', () => {
  const element = Block({block, locale: 'en'})
  assert.equal(element.props.options[0].url, block.eventUrl)
  const html = renderToStaticMarkup(element)
  assert.match(html, /class="contact-appointment"/)
  assert.match(html, /site-button-prominent/)
  assert.match(html, /Reserve your time/)
  assert.match(html, /aria-haspopup="dialog"/)
  assert.match(html, /lucide-calendar-days/)
  assert.match(html, /lucide-arrow-up-right/)
  assert.doesNotMatch(html, /<iframe/)
})

test('Spanish labels remain editable and missing labels receive Spanish copy', () => {
  const custom = renderToStaticMarkup(Block({block: {...block, buttonLabel: 'Reservar una consulta'}, locale: 'es'}))
  assert.match(custom, /Reservar una consulta/)
  const fallback = renderToStaticMarkup(Block({block: {...block, buttonLabel: undefined}, locale: 'es'}))
  assert.match(fallback, /Reserve una cita/)
})

test('unconfigured or unapproved calendars render no booking action', () => {
  for (const eventUrl of [undefined, 'https://example.com/event']) assert.equal(Block({block: {...block, eventUrl}, locale: 'en'}), null)
})

test('existing popup and inline presentations retain their behavior', () => {
  const popup = renderToStaticMarkup(Block({block: {...block, displayMode: 'popup'}, locale: 'en'}))
  assert.match(popup, /calendly-booking-popup-section/)
  assert.doesNotMatch(popup, /site-button-prominent/)
  const inline = renderToStaticMarkup(Block({block: {...block, displayMode: 'inline'}, locale: 'en'}))
  assert.match(inline, /calendly-booking-grid/)
  assert.doesNotMatch(inline, /site-button-prominent/)
})

test('appointment fallback uses the supplied event without overriding explicit block settings', () => {
  const previous = process.env.CONTACT_CALENDLY_EVENT_URL
  try {
    process.env.CONTACT_CALENDLY_EVENT_URL = 'https://calendly.com/dzarma-busatlic/30min'
    assert.equal(Block({block: {...block, eventUrl: undefined}, locale: 'en'}).props.options[0].url, process.env.CONTACT_CALENDLY_EVENT_URL)
    assert.equal(Block({block, locale: 'en'}).props.options[0].url, block.eventUrl)
    assert.equal(Block({block: {...block, eventUrl: undefined, displayMode: 'inline'}, locale: 'en'}), null)
    process.env.CONTACT_CALENDLY_EVENT_URL = 'https://example.com/event'
    assert.equal(Block({block: {...block, eventUrl: undefined}, locale: 'en'}), null)
  } finally {
    if (previous === undefined) delete process.env.CONTACT_CALENDLY_EVENT_URL
    else process.env.CONTACT_CALENDLY_EVENT_URL = previous
  }
})
