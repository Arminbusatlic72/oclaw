import {sanityFetch} from '@/sanity/lib/live'
import {blogPostQuery, blogTranslationQuery, routeCandidatesQuery} from '@/sanity/lib/queries'
import {type Locale} from '@/lib/i18n'
import {postPath, resolveRouteCandidates} from '@/lib/blog-routing'
export {archivePath, archiveId, postPath, resolveRouteCandidates} from '@/lib/blog-routing'

export async function resolveContentRoute(slug: string, locale: Locale) {
  const {data} = await sanityFetch({query: routeCandidatesQuery, params: {slug, language: locale}, perspective: 'published', stega: false})
  return resolveRouteCandidates(data, slug, locale)
}

export async function getPublishedPost(slug: string, locale: Locale) {
  const {data} = await sanityFetch({query: blogPostQuery, params: {slug, language: locale}, perspective: 'published', stega: false})
  return data
}

export async function postTranslationPaths(id: string, locale: Locale, slug: string) {
  const {data} = await sanityFetch({query: blogTranslationQuery, params: {id: id.replace(/^drafts\./, '')}, perspective: 'published', stega: false})
  const paths: Partial<Record<Locale, string>> = {[locale]: postPath(locale, slug)}
  for (const entry of data ?? []) {
    const target = entry.post
    if ((entry.language === 'en' || entry.language === 'es') && target?._id && target.language === entry.language && target.slug && target.publishedAt && new Date(target.publishedAt) <= new Date() && !target.seo?.noIndex) {
      paths[entry.language] = postPath(entry.language, target.slug)
    }
  }
  return paths
}
