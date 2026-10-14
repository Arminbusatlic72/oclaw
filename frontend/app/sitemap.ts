import type {MetadataRoute} from 'next'

import {absoluteUrl, localePath, type Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery, sitemapData} from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

type SitemapPage = {
  _id: string
  language?: string | null
  slug: string
  _updatedAt: string
  seo?: {noIndex?: boolean | null} | null
  translations?: Array<{
    language: string
    page?: {_id: string; language?: string | null; slug?: string | null} | null
  }> | null
}

export function buildSitemap(
  pages: SitemapPage[],
  spanishHome: boolean,
  linkedHomes = false,
  homeIds: string[] = [],
  englishHomeIndex = true,
): MetadataRoute.Sitemap {
  const published = new Map(pages.map((page) => [page._id, page]))
  const homeAlternates = linkedHomes
    ? {
        languages: {
          'en': absoluteUrl('/'),
          'es': absoluteUrl('/es/'),
          'x-default': absoluteUrl('/'),
        },
      }
    : undefined
  const output: MetadataRoute.Sitemap = []
  if (englishHomeIndex) {
    output.push({
      url: absoluteUrl('/'),
      priority: 1,
      changeFrequency: 'monthly',
      alternates: homeAlternates,
    })
  }
  if (spanishHome) {
    output.push({
      url: absoluteUrl('/es/'),
      priority: 1,
      changeFrequency: 'monthly',
      alternates: homeAlternates,
    })
  }
  for (const page of pages) {
    if (homeIds.includes(page._id)) continue
    if (page.seo?.noIndex) continue
    const locale: Locale = page.language === 'es' ? 'es' : 'en'
    const path = localePath(locale, page.slug)
    const paths: Partial<Record<Locale, string>> = {[locale]: path}
    for (const item of page.translations ?? []) {
      const translated = item.page
      if (
        translated &&
        (item.language === 'en' || item.language === 'es') &&
        (translated?.language === item.language ||
          (item.language === 'en' && !translated?.language)) &&
        translated.slug &&
        published.has(translated._id) &&
        !published.get(translated._id)?.seo?.noIndex
      ) {
        paths[item.language] = localePath(item.language, translated.slug)
      }
    }
    const languages: Record<string, string> = {}
    if (paths.en) {
      languages.en = absoluteUrl(paths.en)
      languages['x-default'] = absoluteUrl(paths.en)
    }
    if (paths.es) languages.es = absoluteUrl(paths.es)
    output.push({
      url: absoluteUrl(path),
      lastModified: page._updatedAt,
      priority: 0.8,
      changeFrequency: 'monthly',
      alternates: Object.keys(languages).length > 1 ? {languages} : undefined,
    })
  }
  return output
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{data: pages}, {data: englishHome}, {data: spanishHome}] = await Promise.all([
    sanityFetch({query: sitemapData, perspective: 'published', stega: false}),
    sanityFetch({
      query: homePageQuery,
      params: {id: 'siteSettings'},
      perspective: 'published',
      stega: false,
    }),
    sanityFetch({
      query: homePageQuery,
      params: {id: 'siteSettings-es'},
      perspective: 'published',
      stega: false,
    }),
  ])
  const linkedHomes = Boolean(
    englishHome?._id &&
    spanishHome?._id &&
    spanishHome.language === 'es' &&
    !englishHome?.seo?.noIndex &&
    !spanishHome.seo?.noIndex &&
    pages.some(
      (page) =>
        page._id === englishHome._id &&
        page.translations?.some(
          (item) => item.language === 'es' && item.page?._id === spanishHome._id,
        ),
    ),
  )
  return buildSitemap(
    pages,
    spanishHome?.language === 'es' && !spanishHome.seo?.noIndex,
    linkedHomes,
    [englishHome?._id, spanishHome?._id].filter((id): id is string => Boolean(id)),
    !englishHome?.seo?.noIndex,
  )
}
