import type {Metadata} from 'next'
import {absoluteUrl, type Locale} from './i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {collectionTranslationQuery, practiceSelectionTranslationsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {collectionPath, type Collection} from './collection-routing'
export {collectionPath, type Collection} from './collection-routing'

export function archiveId(locale: Locale) {return `practiceAreaArchive-${locale}`}

export async function collectionTranslationPaths(id: string, type: Collection, locale: Locale, slug: string) {
  const {data} = await sanityFetch({query: collectionTranslationQuery, params: {id}, perspective: 'published', stega: false})
  const result: Partial<Record<Locale, string>> = {[locale]: collectionPath(type, locale, slug)}
  for (const item of data || []) {
    if ((item.language === 'en' || item.language === 'es') && item.target?._type === type && item.target.language === item.language && item.target.slug && !item.target.noIndex)
      result[item.language] = collectionPath(type, item.language, item.target.slug)
  }
  return result
}

export async function collectionMetadata(source: {_id: string; slug: string; title?: string | null; fullName?: string | null; name?: string | null; shortDescription?: string | null; shortBiography?: string | null; seo?: {title?: string | null; description?: string | null; noIndex?: boolean | null; openGraphImage?: Parameters<typeof resolveOpenGraphImage>[0]} | null; mainImage?: Parameters<typeof resolveOpenGraphImage>[0]; profileImage?: Parameters<typeof resolveOpenGraphImage>[0]; image?: Parameters<typeof resolveOpenGraphImage>[0]}, type: Collection, locale: Locale): Promise<Metadata> {
  const path = collectionPath(type, locale, source.slug)
  const linked = await collectionTranslationPaths(source._id, type, locale, source.slug)
  const languages: Record<string, string> = {}
  if (linked.en) {languages.en = absoluteUrl(linked.en); languages['x-default'] = absoluteUrl(linked.en)}
  if (linked.es) languages.es = absoluteUrl(linked.es)
  const title = source.seo?.title || source.title || source.fullName || source.name || undefined
  const description = source.seo?.description || source.shortDescription || source.shortBiography || undefined
  const image = resolveOpenGraphImage(source.seo?.openGraphImage || source.mainImage || source.profileImage || source.image)
  return {title, description, alternates: {canonical: absoluteUrl(path), languages}, robots: source.seo?.noIndex ? {index: false, follow: false} : undefined, openGraph: {title, description, url: absoluteUrl(path), locale: locale === 'es' ? 'es_ES' : 'en_US', images: image ? [image] : undefined}}
}

export async function selectedPracticeAreas<T extends {_id: string; language: string | null; featuredOnHomepage?: boolean | null}>(all: T[], locale: Locale, mode: string | null | undefined, refs: Array<{_ref?: string}> | null | undefined, max: number | null | undefined) {
  const limit = Math.min(24, Math.max(1, max || 6))
  if (mode !== 'manual') return all.filter((area) => area.featuredOnHomepage).slice(0, limit)
  const ids = (refs || []).map((ref) => ref._ref).filter((id): id is string => Boolean(id))
  if (!ids.length) return []
  const {data: groups} = await sanityFetch({query: practiceSelectionTranslationsQuery, params: {ids}, perspective: 'published', stega: false})
  const byId = new Map(all.map((area) => [area._id, area]))
  const translated = new Map<string, string>()
  for (const group of groups || []) {
    const destination = group.translations?.find((item) => item.language === locale && item.target?._type === 'practiceArea' && item.target.language === locale && item.target.slug)?.target?._id
    if (destination) for (const item of group.translations || []) if (item.target?._id) translated.set(item.target._id, destination)
  }
  return ids.map((id) => byId.get(id) || byId.get(translated.get(id) || '')).filter((area): area is T => Boolean(area)).slice(0, limit)
}

export function breadcrumbs(items: Array<{name: string; path: string}>) {
  return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({'@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path)}))}
}
