import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import DynamicPage from '@/app/components/DynamicPage'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: homePageQuery,
    params: {id: 'siteSettings-es'},
    stega: false,
  })
  if (!page || page.language !== 'es') return {}
  return pageMetadata(page, 'es', null, true)
}

export default async function Page() {
  const {data: page} = await sanityFetch({
    query: homePageQuery,
    params: {id: 'siteSettings-es'},
  })
  if (!page || page.language !== 'es') notFound()
  return <DynamicPage page={await localizeContent(page, 'es')} />
}
