import test from 'node:test'
import assert from 'node:assert/strict'
import {validateContentSlug} from '../src/lib/isUniqueContentSlug.ts'

function context(language = 'es', result = true) {
  let seen
  return {
    document: {_id: 'drafts.area-1', _type: 'practiceArea', language},
    getClient: () => ({fetch: async (query, params, options) => {seen = {query, params, options}; return result}}),
    get seen() {return seen},
  }
}

test('content slug collisions are scoped by document type and language and include drafts', async () => {
  const ctx = context('es', false)
  assert.match(await validateContentSlug({current: 'el-patrocinio-de-la-familia'}, ctx), /already in use/)
  assert.equal(ctx.seen.params.type, 'practiceArea')
  assert.equal(ctx.seen.params.language, 'es')
  assert.equal(ctx.seen.params.id, 'area-1')
  assert.equal(ctx.seen.params.draftId, 'drafts.area-1')
  assert.equal(ctx.seen.options.perspective, 'raw')
})

test('content slugs reject URL-breaking characters before querying', async () => {
  const ctx = context()
  assert.match(await validateContentSlug({current: 'family/sponsorship'}, ctx), /lowercase/)
  assert.equal(ctx.seen, undefined)
})
