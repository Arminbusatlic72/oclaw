import Navbar from '@/components/Navbar'
import {getNavigation} from '@/lib/queries/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {settingsId, type Locale} from '@/lib/i18n'
import {translationPaths} from '@/lib/localized-content'
import {headers} from 'next/headers'
import {getPageQuery, homePageQuery} from '@/sanity/lib/queries'

/** Server component wrapper that fetches Sanity navigation data. */
export default async function NavbarWrapper({locale}: {locale: Locale}) {
  const path = (await headers()).get('x-oclaw-path') || '/'
  const slug = path.replace(/^\/(es\/)?|\/$/g, '')
  const [navigation, settingsResult] = await Promise.all([
    getNavigation(locale),
    sanityFetch({query: settingsQuery, params: {id: settingsId(locale)}}),
  ])
  const {data: page} = slug
    ? await sanityFetch({query: getPageQuery, params: {slug, language: locale}, stega: false})
    : await sanityFetch({query: homePageQuery, params: {id: settingsId(locale)}, stega: false})
  const available = page?._id
    ? await translationPaths(page._id, locale, slug || null, !slug)
    : {[locale]: locale === 'es' ? '/es/' : '/'}

  return (
    <Navbar
      data={navigation}
      siteTitle={settingsResult.data?.title}
      locale={locale}
      availableLanguages={available}
    />
  )
}
