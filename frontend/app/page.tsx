import type {Metadata} from 'next'

import DynamicPage from '@/app/components/DynamicPage'
import HomepageSetupRequired from '@/app/components/HomepageSetupRequired'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: homePageQuery,
    params: {id: 'siteSettings'},
    stega: false,
  })
  if (!page || (page.language && page.language !== 'en')) {
    return {
      title: 'Homepage setup required',
      alternates: {canonical: 'https://www.oclaw.us/'},
      robots: {index: false, follow: false},
    }
  }
  return pageMetadata(page, 'en', null, true)
}

export default async function Page() {
  const [{data: settings}, {data: homePage}] = await Promise.all([
    sanityFetch({query: settingsQuery, params: {id: 'siteSettings'}}),
    sanityFetch({query: homePageQuery, params: {id: 'siteSettings'}}),
  ])
  if (homePage && (!homePage.language || homePage.language === 'en')) {
    return <DynamicPage page={await localizeContent(homePage, 'en')} />
  }

  return (
    <HomepageSetupRequired
      locale="en"
      hasSettings={Boolean(settings)}
      hasHomepageReference={Boolean(settings?.homePage?._ref)}
    />
  )
}
