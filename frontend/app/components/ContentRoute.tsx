import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'
import DynamicPage from './DynamicPage'
import BlogArticle from './BlogArticle'
import {getPublishedPost, resolveContentRoute} from '@/lib/blog'
import {postMetadata} from '@/lib/blog-metadata'
import {type Locale} from '@/lib/i18n'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, homePageIdsQuery} from '@/sanity/lib/queries'

export async function contentMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const route = await resolveContentRoute(slug, locale)
  if (!route) return {}
  if (route._type === 'blogPost') {
    const post = await getPublishedPost(slug, locale)
    return post ? postMetadata(post, locale) : {}
  }
  const {data: page} = await sanityFetch({query: getPageQuery, params: {slug, language: locale}, perspective: 'published', stega: false})
  return page ? pageMetadata(page, locale, slug) : {}
}

export default async function ContentRoute({slug, locale}: {slug: string; locale: Locale}) {
  const route = await resolveContentRoute(slug, locale)
  if (!route) notFound()
  if (route._type === 'blogPost') {
    const post = await getPublishedPost(slug, locale)
    if (!post) notFound()
    return <BlogArticle post={post} locale={locale} />
  }
  const {data: page} = await sanityFetch({query: getPageQuery, params: {slug, language: locale}})
  if (!page) notFound()
  const {data: homes} = await sanityFetch({query: homePageIdsQuery, stega: false})
  if (homes.some((home) => home._id === (locale === 'es' ? 'siteSettings-es' : 'siteSettings') && home.pageId === page._id.replace(/^drafts\./, ''))) permanentRedirect(locale === 'es' ? '/es/' : '/')
  return <DynamicPage page={await localizeContent(page, locale)} />
}
