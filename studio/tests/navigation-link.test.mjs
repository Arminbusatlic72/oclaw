import test from 'node:test'
import assert from 'node:assert/strict'
import {hasUsableLink} from '../src/lib/hasUsableLink.ts'
import {link} from '../src/schemaTypes/objects/link.ts'

test('new link objects start with a supported type', () => {
  const type = link.fields.find((field) => field.name === 'linkType')
  assert.equal(type.initialValue, 'href')
  assert.ok(type.options.list.some((option) => option.value === type.initialValue))
  assert.ok(type.options.list.some((option) => option.value === 'route'))
  const route = link.fields.find((field) => field.name === 'route')
  assert.ok(route.options.list.some((option) => option.value === 'attorneys'))
})

test('empty or invalid link objects do not satisfy a navigation destination', () => {
  assert.equal(hasUsableLink({_type: 'link', linkType: 'page'}), false)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'href'}), false)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'url', href: '/about-us/'}), false)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'page', page: {_ref: 'practiceAreaArchive-en'}}), true)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'href', href: '/about-us/'}), true)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'route'}), false)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'route', route: 'attorneys'}), true)
  assert.equal(hasUsableLink({_type: 'link', linkType: 'route', route: 'offices'}), true)
})
