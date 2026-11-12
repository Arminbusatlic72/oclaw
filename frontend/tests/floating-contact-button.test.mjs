import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import ts from 'typescript'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {dictionary, localePath} from '../lib/i18n.ts'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../app/components/FloatingContactButton.tsx', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX}})

function render(locale, pathname) {
  const dependencies = {
    './FloatingContactButton.module.css': {button: 'contact-button'},
    'next/link': ({href, children, ...props}) => React.createElement('a', {href, ...props}, children),
    'next/navigation': {usePathname: () => pathname},
    '@/lib/i18n': {dictionary, localePath},
  }
  const compiled = {exports: {}}
  new Function('require', 'module', 'exports', outputText)((id) => dependencies[id] || require(id), compiled, compiled.exports)
  return renderToStaticMarkup(React.createElement(compiled.exports.default, {locale}))
}

test('shared contact action resolves the label and destination for every page family in both languages', () => {
  const pages = {
    en: ['/', '/about-us/', '/practice-areas/', '/attorneys/example/'],
    es: ['/es/', '/es/nosotros/', '/es/areas-de-practica/', '/es/abogados/example/'],
  }
  for (const [locale, paths] of Object.entries(pages)) {
    for (const pathname of paths) {
      const html = render(locale, pathname)
      assert.match(html, new RegExp(`href="${locale === 'es' ? '/es/contacto/' : '/contact/'}"`))
      assert.ok(html.includes(`aria-label="${dictionary[locale].contactUs}"`))
      assert.ok(html.includes(`<span>${dictionary[locale].contactUs}</span>`))
      assert.match(html, /aria-hidden="true"/)
    }
  }
})

test('Contact pages omit the redundant action with or without a trailing slash', () => {
  for (const [locale, path] of [['en', '/contact'], ['es', '/es/contacto']]) {
    assert.equal(render(locale, path), '')
    assert.equal(render(locale, `${path}/`), '')
  }
})
