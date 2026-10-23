import type {SlugValidationContext, SlugValue, ValidationContext} from 'sanity'

import {DEFAULT_LANGUAGE} from '../i18n/config'

export const RESERVED_PAGE_SLUGS = new Set([
  'api',
  'es',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  '_next',
  'blog',
  'blog-espanol',
  'practice-areas',
  'areas-de-practica',
  'attorneys',
  'abogados',
  'offices',
  'oficinas',
  'studio',
  'opengraph-image',
  'icon',
  'apple-icon',
])

export async function validatePageSlug(value: SlugValue | undefined, context: ValidationContext) {
  const slug = value?.current?.trim().toLowerCase()

  if (!slug) return true
  if (slug.includes('/') || slug.includes('?') || slug.includes('#') || slug.includes('.')) return 'Slugs must contain a single URL-safe segment'
  if (RESERVED_PAGE_SLUGS.has(slug)) return `"${slug}" is reserved by the application`

  return (await isUniquePageSlug(slug, context as SlugValidationContext))
    ? true
    : `"${slug}" is already used by a page or blog post in this language`
}

/** Pages and posts share the same public URL namespace within each language. */
export async function isUniquePageSlug(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context

  if (!document) return true

  const documentId = document._id.replace(/^drafts\./, '')
  const draftId = `drafts.${documentId}`
  const language = typeof document.language === 'string' ? document.language : DEFAULT_LANGUAGE

  return getClient({apiVersion: '2025-09-25'}).fetch<boolean>(
    `!defined(*[
      _type in ["page", "blogPost"] &&
      slug.current == $slug &&
      coalesce(language, $defaultLanguage) == $language &&
      !(_id in [$documentId, $draftId])
    ][0]._id)`,
    {
      slug,
      language,
      defaultLanguage: DEFAULT_LANGUAGE,
      documentId,
      draftId,
    },
    {perspective: 'raw'},
  )
}
