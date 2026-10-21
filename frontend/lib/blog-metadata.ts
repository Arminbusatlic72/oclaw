import type {Metadata} from 'next'
import {absoluteUrl, type Locale} from '@/lib/i18n'
import {archivePath, postPath, postTranslationPaths} from '@/lib/blog'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Seo = {title?: string | null; description?: string | null; noIndex?: boolean | null; openGraphImage?: Parameters<typeof resolveOpenGraphImage>[0]} | null
export async function postMetadata(post: {_id: string; title: string | null; slug: string | null; excerpt?: string | null; publishedAt: string | null; updatedAt?: string | null; featuredImage?: Parameters<typeof resolveOpenGraphImage>[0]; seo?: Seo}, locale: Locale): Promise<Metadata> {
  const path = postPath(locale, post.slug!)
  const paths = await postTranslationPaths(post._id, locale, post.slug!)
  const languages: Record<string, string> = {}
  if (paths.en) { languages.en = absoluteUrl(paths.en); languages['x-default'] = absoluteUrl(paths.en) }
  if (paths.es) languages.es = absoluteUrl(paths.es)
  const title = post.seo?.title || post.title || undefined
  const description = post.seo?.description || post.excerpt || undefined
  const image = resolveOpenGraphImage(post.seo?.openGraphImage || post.featuredImage)
  return {title, description, alternates: {canonical: absoluteUrl(path), languages}, robots: post.seo?.noIndex ? {index: false, follow: false} : undefined,
    openGraph: {type: 'article', title, description, url: absoluteUrl(path), locale: locale === 'es' ? 'es_ES' : 'en_US', publishedTime: post.publishedAt || undefined, modifiedTime: post.updatedAt || undefined, images: image ? [image] : undefined}}
}

export function archiveMetadata(archive: {heading?: string | null; description?: string | null; seo?: Seo} | null, locale: Locale, page: number): Metadata {
  const base = archivePath(locale)
  const path = page > 1 ? `${base}?page=${page}` : base
  const title = archive?.seo?.title || archive?.heading || (locale === 'es' ? 'Blog en Español' : 'Blog')
  const description = archive?.seo?.description || archive?.description || undefined
  const image = resolveOpenGraphImage(archive?.seo?.openGraphImage)
  return {title, description, alternates: {canonical: absoluteUrl(path), languages: page === 1 ? {en: absoluteUrl(archivePath('en')), es: absoluteUrl(archivePath('es')), 'x-default': absoluteUrl(archivePath('en'))} : undefined}, robots: archive?.seo?.noIndex ? {index: false, follow: false} : undefined,
    openGraph: {title, description, url: absoluteUrl(path), locale: locale === 'es' ? 'es_ES' : 'en_US', images: image ? [image] : undefined}}
}
