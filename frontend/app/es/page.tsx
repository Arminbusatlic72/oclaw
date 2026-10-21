import type {Metadata} from 'next'

import DynamicPage from '@/app/components/DynamicPage'
import HomepageSetupRequired from '@/app/components/HomepageSetupRequired'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery, settingsQuery} from '@/sanity/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: homePageQuery,
    params: {id: 'siteSettings-es'},
    stega: false,
  })
  if (!page || page.language !== 'es') {
    return {
      title: 'Se requiere configurar la página de inicio',
      alternates: {canonical: 'https://www.oclaw.us/es/'},
      robots: {index: false, follow: false},
    }
  }
  return pageMetadata(page, 'es', null, true)
}

export default async function Page() {
  const [{data: settings}, {data: page}] = await Promise.all([
    sanityFetch({query: settingsQuery, params: {id: 'siteSettings-es'}}),
    sanityFetch({query: homePageQuery, params: {id: 'siteSettings-es'}}),
  ])
  if (page?.language === 'es') {
    return <DynamicPage page={await localizeContent(page, 'es')} isHomepage />
  }

  return (
    <HomepageSetupRequired
      locale="es"
      hasSettings={Boolean(settings)}
      hasHomepageReference={Boolean(settings?.homePage?._ref)}
    />
  )
}
