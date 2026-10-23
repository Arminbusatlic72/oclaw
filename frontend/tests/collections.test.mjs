import test from 'node:test'
import assert from 'node:assert/strict'
import {collectionPath} from '../lib/collection-routing.ts'

test('collection routes preserve the English and Spanish URL namespaces', () => {
  assert.equal(collectionPath('practiceArea', 'en', 'family-sponsorship'), '/practice-areas/family-sponsorship/')
  assert.equal(collectionPath('practiceArea', 'es', 'el-patrocinio-de-la-familia'), '/es/areas-de-practica/el-patrocinio-de-la-familia/')
  assert.equal(collectionPath('attorney', 'en'), '/attorneys/')
  assert.equal(collectionPath('attorney', 'es', 'ejemplo'), '/es/abogados/ejemplo/')
  assert.equal(collectionPath('office', 'es'), '/es/oficinas/')
})
