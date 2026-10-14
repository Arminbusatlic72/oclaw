import {sanityFetch} from '@/sanity/lib/live'
import {homePageIdsQuery, translationQuery} from '@/sanity/lib/queries'
import {
  linkedTranslationPaths,
  localePath,
  mapContentLinks,
  type Locale,
  type PageTarget,
} from '@/lib/i18n'

export async function translationPaths(
  id: string,
  currentLocale: Locale,
  currentSlug?: string | null,
  isHome = false,
) {
  const sourceId = id.replace(/^drafts\./, '')
  const [{data}, {data: homes}] = await Promise.all([
    sanityFetch({query: translationQuery, params: {id: sourceId}, stega: false}),
    sanityFetch({query: homePageIdsQuery, stega: false}),
  ])
  const homeIds = Object.fromEntries(
    homes.map((home) => [home._id === 'siteSettings-es' ? 'es' : 'en', home.pageId]),
  )
  return linkedTranslationPaths(currentLocale, currentSlug, data?.translations, homeIds, isHome)
}

async function resolvePageTarget(target: PageTarget, locale: Locale) {
  const {data: homes} = await sanityFetch({query: homePageIdsQuery, stega: false})
  const home = homes.find(
    (item) => item._id === (locale === 'es' ? 'siteSettings-es' : 'siteSettings'),
  )
  if (home?.pageId === target._id.replace(/^drafts\./, '')) return localePath(locale)
  if (target.language === locale || (locale === 'en' && !target.language)) {
    return target.slug ? localePath(locale, target.slug) : null
  }
  const paths = await translationPaths(
    target._id,
    target.language === 'es' ? 'es' : 'en',
    target.slug,
  )
  const localizedId = await sanityFetch({
    query: translationQuery,
    params: {id: target._id.replace(/^drafts\./, '')},
    stega: false,
  })
  const translated = localizedId.data?.translations?.find(
    (entry) => entry.language === locale,
  )?.page
  if (translated?._id && home?.pageId === translated._id.replace(/^drafts\./, ''))
    return localePath(locale)
  return paths[locale] ?? null
}

/**
 * Resolve page references before sending page-builder data to client components.
 * A missing target is deliberately removed instead of falling back across languages.
 */
export async function localizeContent<T>(input: T, locale: Locale): Promise<T> {
  return mapContentLinks(input, locale, resolvePageTarget)
}
