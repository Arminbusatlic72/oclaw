import assert from 'node:assert/strict'
import test from 'node:test'
import {archivePath, postPath, resolveRouteCandidates} from '../lib/blog-routing.ts'

test('archives and articles retain their public URL shape', () => {
  assert.equal(archivePath('en'), '/blog/')
  assert.equal(archivePath('es'), '/es/blog-espanol/')
  assert.equal(postPath('en', 'understanding-common-reasons-uscis-may-reject-your-case'), '/understanding-common-reasons-uscis-may-reject-your-case/')
  assert.equal(postPath('es', 'un-articulo'), '/es/un-articulo/')
})

test('page and post collisions are reported rather than prioritized', () => {
  assert.throws(() => resolveRouteCandidates([{_id: 'page-1', _type: 'page'}, {_id: 'post-1', _type: 'blogPost'}], 'same-slug', 'en'), /URL collision at \/same-slug\//)
  assert.deepEqual(resolveRouteCandidates([{_id: 'post-1', _type: 'blogPost'}], 'one', 'es'), {_id: 'post-1', _type: 'blogPost'})
  assert.equal(resolveRouteCandidates([], 'missing', 'en'), null)
})
