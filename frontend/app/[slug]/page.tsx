import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import DynamicPage from '@/app/components/DynamicPage'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {homePageIdsQuery} from '@/sanity/lib/queries'

type Props = {params: Promise<{slug: string}>}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    params: {language: 'en'},
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params: {slug, language: 'en'},
    stega: false,
  })
  if (!page) return {}
  return pageMetadata(page, 'en', slug)
}

export default async function Page({params}: Props) {
  const {slug} = await params
  const {data: page} = await sanityFetch({query: getPageQuery, params: {slug, language: 'en'}})
  if (!page) notFound()
  const {data: homes} = await sanityFetch({query: homePageIdsQuery, stega: false})
  if (
    homes.some(
      (home) => home._id === 'siteSettings' && home.pageId === page._id.replace(/^drafts\./, ''),
    )
  ) {
    permanentRedirect('/')
  }
  return <DynamicPage page={await localizeContent(page, 'en')} />
}
