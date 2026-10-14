import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import DynamicPage from '@/app/components/DynamicPage'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, homePageIdsQuery, pagesSlugs} from '@/sanity/lib/queries'

type Props = {params: Promise<{slug: string}>}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    params: {language: 'es'},
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params: {slug, language: 'es'},
    stega: false,
  })
  if (!page) return {}
  return pageMetadata(page, 'es', slug)
}

export default async function Page({params}: Props) {
  const {slug} = await params
  const {data: page} = await sanityFetch({query: getPageQuery, params: {slug, language: 'es'}})
  if (!page) notFound()
  const {data: homes} = await sanityFetch({query: homePageIdsQuery, stega: false})
  if (
    homes.some(
      (home) => home._id === 'siteSettings-es' && home.pageId === page._id.replace(/^drafts\./, ''),
    )
  ) {
    permanentRedirect('/es/')
  }
  return <DynamicPage page={await localizeContent(page, 'es')} />
}
