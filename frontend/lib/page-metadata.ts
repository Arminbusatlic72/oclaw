import type {Metadata} from 'next'

import {absoluteUrl, localePath, type Locale} from '@/lib/i18n'
import {translationPaths} from '@/lib/localized-content'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type PageMetadataSource = {
  _id: string
  name?: string | null
  heading?: string | null
  seo?: {
    title?: string | null
    description?: string | null
    openGraphImage?: Parameters<typeof resolveOpenGraphImage>[0]
    noIndex?: boolean | null
  } | null
}

export async function pageMetadata(
  page: PageMetadataSource,
  locale: Locale,
  slug?: string | null,
  isHome = false,
): Promise<Metadata> {
  const paths = await translationPaths(page._id, locale, slug, isHome)
  const canonical = localePath(locale, slug)
  const languages: Record<string, string> = {}
  if (paths.en) {
    languages.en = absoluteUrl(paths.en)
    languages['x-default'] = absoluteUrl(paths.en)
  }
  if (paths.es) languages.es = absoluteUrl(paths.es)
  const title = page.seo?.title || page.name || page.heading || undefined
  const description = page.seo?.description || page.heading || undefined
  const image = page.seo?.openGraphImage
    ? resolveOpenGraphImage(page.seo.openGraphImage)
    : undefined
  return {
    title,
    description,
    alternates: {canonical: absoluteUrl(canonical), languages},
    robots: page.seo?.noIndex ? {index: false, follow: false} : undefined,
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      images: image ? [image] : undefined,
    },
  }
}
