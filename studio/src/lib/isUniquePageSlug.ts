import type {SlugValidationContext, SlugValue} from 'sanity'

import {DEFAULT_LANGUAGE} from '../i18n/config'

export const RESERVED_PAGE_SLUGS = new Set([
  'api',
  'es',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  '_next',
])

export function validatePageSlug(value: SlugValue | undefined) {
  const slug = value?.current?.trim().toLowerCase()

  if (!slug) return true
  if (slug.includes('/')) return 'Page slugs must contain a single URL segment'
  if (RESERVED_PAGE_SLUGS.has(slug)) return `"${slug}" is reserved by the application`

  return true
}

/** Allows the same slug in different languages, but not within one language. */
export async function isUniquePageSlug(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context

  if (!document) return true

  const documentId = document._id.replace(/^drafts\./, '')
  const draftId = `drafts.${documentId}`
  const language = typeof document.language === 'string' ? document.language : DEFAULT_LANGUAGE

  return getClient({apiVersion: '2025-09-25'}).fetch<boolean>(
    `!defined(*[
      _type == $type &&
      slug.current == $slug &&
      coalesce(language, $defaultLanguage) == $language &&
      !(_id in [$documentId, $draftId])
    ][0]._id)`,
    {
      type: document._type,
      slug,
      language,
      defaultLanguage: DEFAULT_LANGUAGE,
      documentId,
      draftId,
    },
  )
}
