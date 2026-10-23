import type {Metadata} from 'next'
import {CollectionArchive, CollectionDetail} from './CollectionPages'
import {archiveId, collectionMetadata, collectionPath, type Collection} from '@/lib/collections'
import {absoluteUrl, type Locale} from '@/lib/i18n'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {sanityFetch} from '@/sanity/lib/live'
import {attorneyQuery, officeQuery, practiceAreaArchiveQuery, practiceAreaQuery} from '@/sanity/lib/queries'

export async function archiveMetadata(type: Collection, locale: Locale): Promise<Metadata> {
  const path = collectionPath(type, locale)
  const archive = type === 'practiceArea' ? (await sanityFetch({query: practiceAreaArchiveQuery, params: {id: archiveId(locale)}, perspective: 'published', stega: false})).data : null
  const title = archive?.seo?.title || archive?.heading || ({practiceArea: locale === 'es' ? 'Áreas de práctica' : 'Practice Areas', attorney: locale === 'es' ? 'Abogados' : 'Attorneys', office: locale === 'es' ? 'Oficinas' : 'Offices'})[type]
  const description = archive?.seo?.description || archive?.description || undefined
  const image = resolveOpenGraphImage(archive?.seo?.openGraphImage)
  const languages = {en: absoluteUrl(collectionPath(type, 'en')), es: absoluteUrl(collectionPath(type, 'es')), 'x-default': absoluteUrl(collectionPath(type, 'en'))}
  return {title, description, alternates: {canonical: absoluteUrl(path), languages}, robots: archive?.seo?.noIndex ? {index: false, follow: false} : undefined, openGraph: {title, description, url: absoluteUrl(path), locale: locale === 'es' ? 'es_ES' : 'en_US', images: image ? [image] : undefined}}
}
export async function detailMetadata(type: Collection, locale: Locale, slug: string): Promise<Metadata> {
  if (type === 'practiceArea') {const {data} = await sanityFetch({query: practiceAreaQuery, params: {language: locale, slug}, perspective: 'published', stega: false}); return data ? collectionMetadata(data, type, locale) : {}}
  if (type === 'attorney') {const {data} = await sanityFetch({query: attorneyQuery, params: {language: locale, slug}, perspective: 'published', stega: false}); return data ? collectionMetadata(data, type, locale) : {}}
  const {data} = await sanityFetch({query: officeQuery, params: {language: locale, slug}, perspective: 'published', stega: false}); return data ? collectionMetadata(data, type, locale) : {}
}
export {CollectionArchive, CollectionDetail}
