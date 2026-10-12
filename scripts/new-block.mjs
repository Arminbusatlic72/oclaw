#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

function toPascalCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

function toCamelCase(value) {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function getArgValue(flag) {
  const idx = process.argv.findIndex((arg) => arg === flag)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

const rawName = getArgValue('--name') || getArgValue('-n')
if (!rawName) {
  console.error('Usage: pnpm new:block --name FeatureCards')
  process.exit(1)
}

const blockType = toCamelCase(rawName)
const componentName = toPascalCase(rawName)
const title = componentName.replace(/([a-z])([A-Z])/g, '$1 $2')

const projectRoot = process.cwd()
const schemaFile = path.join(
  projectRoot,
  'studio',
  'src',
  'schemaTypes',
  'blocks',
  `${blockType}.ts`,
)
const componentDir = path.join(
  projectRoot,
  'frontend',
  'app',
  'components',
  'blocks',
  componentName,
)
const componentFile = path.join(componentDir, 'index.tsx')

if (fs.existsSync(schemaFile)) {
  console.error(`Block schema already exists: ${schemaFile}`)
  process.exit(1)
}

if (fs.existsSync(componentFile)) {
  console.error(`Block component already exists: ${componentFile}`)
  process.exit(1)
}

fs.mkdirSync(path.dirname(schemaFile), {recursive: true})
fs.mkdirSync(componentDir, {recursive: true})

const schemaContent = `import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons'

export const ${blockType} = defineType({
  name: '${blockType}',
  title: '${title}',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'body',
    },
    prepare(selection) {
      return {
        title: selection.title || '${title}',
        subtitle: selection.subtitle || '${blockType}',
      }
    },
  },
})
`

const componentContent = `type ${componentName}Block = {
  _key: string
  _type: '${blockType}'
  heading?: string | null
  body?: string | null
}

type ${componentName}Props = {
  block: ${componentName}Block
}

export default function ${componentName}({block}: ${componentName}Props) {
  return (
    <section className="container mx-auto py-12">
      {block.heading && <h2 className="text-3xl font-semibold text-gray-900">{block.heading}</h2>}
      {block.body && <p className="mt-4 text-base text-gray-600">{block.body}</p>}
    </section>
  )
}
`

fs.writeFileSync(schemaFile, schemaContent, 'utf8')
fs.writeFileSync(componentFile, componentContent, 'utf8')

console.log('\nCreated:')
console.log(`- studio/src/schemaTypes/blocks/${blockType}.ts`)
console.log(`- frontend/app/components/blocks/${componentName}/index.tsx`)

console.log('\nNext steps:')
console.log(
  `1. Register schema in studio/src/schemaTypes/index.ts (import and add ${blockType} to schemaTypes).`,
)
console.log(
  `2. Add {type: '${blockType}'} to the pageBuilder array in studio/src/schemaTypes/documents/page.ts.`,
)
console.log(
  `3. Import ${componentName} and map '${blockType}' in frontend/app/components/BlockRenderer.tsx.`,
)
console.log(
  `4. Extend the page query projection in frontend/sanity/lib/queries.ts for '${blockType}'.`,
)
console.log('5. Run: pnpm --filter frontend sanity:typegen')
