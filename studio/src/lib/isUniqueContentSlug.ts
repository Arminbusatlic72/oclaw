import type {SlugValidationContext, SlugValue, ValidationContext} from 'sanity'

/** Dedicated collections have distinct URL namespaces, but slugs must be unique within each locale. */
export async function validateContentSlug(value: SlugValue | undefined, context: ValidationContext) {
  const slug = value?.current?.trim()
  if (!slug) return true
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Use lowercase letters, numbers and hyphens only'
  const document = context.document
  if (!document?._type || !document?._id) return true
  const id = document._id.replace(/^drafts\./, '')
  const unique = await context.getClient({apiVersion: '2025-09-25'}).fetch<boolean>(
    `!defined(*[_type == $type && slug.current == $slug && language == $language && !(_id in [$id, $draftId])][0]._id)`,
    {type: document._type, slug, language: document.language || 'en', id, draftId: `drafts.${id}`},
    {perspective: 'raw'},
  )
  return unique || 'This slug is already in use for this language'
}

export async function isUniqueContentSlug(slug: string, context: SlugValidationContext) {
  return (await validateContentSlug({current: slug, _type: 'slug'}, context)) === true
}
