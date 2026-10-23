import Navbar from '@/components/Navbar'
import {getNavigation} from '@/lib/queries/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {settingsId, type Locale} from '@/lib/i18n'
import {translationPaths} from '@/lib/localized-content'
import {headers} from 'next/headers'
import {getPageQuery, homePageQuery} from '@/sanity/lib/queries'
import {archivePath, getPublishedPost, postTranslationPaths, resolveContentRoute} from '@/lib/blog'
import {collectionPath, collectionTranslationPaths, type Collection} from '@/lib/collections'
import {attorneyQuery, officeQuery, practiceAreaQuery} from '@/sanity/lib/queries'

/** Server component wrapper that fetches Sanity navigation data. */
export default async function NavbarWrapper({locale}: {locale: Locale}) {
  const path = (await headers()).get('x-oclaw-path') || '/'
  const slug = path.replace(/^\/(es\/)?|\/$/g, '')
  const [navigation, settingsResult] = await Promise.all([
    getNavigation(locale),
    sanityFetch({query: settingsQuery, params: {id: settingsId(locale)}}),
  ])
  let available: Partial<Record<Locale, string>>
  const collection = ([
    {type: 'practiceArea', en: '/practice-areas/', es: '/es/areas-de-practica/'},
    {type: 'attorney', en: '/attorneys/', es: '/es/abogados/'},
    {type: 'office', en: '/offices/', es: '/es/oficinas/'},
  ] as const).find((item) => path === item[locale] || path.startsWith(item[locale]))
  if (collection) {
    const type = collection.type as Collection
    const detailSlug = path.slice(collection[locale].length).replace(/\/$/, '')
    if (!detailSlug) available = {en: collectionPath(type, 'en'), es: collectionPath(type, 'es')}
    else {
      const query = type === 'practiceArea' ? practiceAreaQuery : type === 'attorney' ? attorneyQuery : officeQuery
      // Each query uses the same id/slug/language projection needed for translation links.
      const {data} = await sanityFetch({query, params: {language: locale, slug: decodeURIComponent(detailSlug)}, perspective: 'published', stega: false})
      available = data?._id ? await collectionTranslationPaths(data._id, type, locale, detailSlug) : {[locale]: path}
    }
  } else if (path === '/blog/' || path === '/es/blog-espanol/') {
    available = {en: archivePath('en'), es: archivePath('es')}
  } else {
    const route = slug ? await resolveContentRoute(slug, locale) : null
    if (route?._type === 'blogPost') {
      const post = await getPublishedPost(slug, locale)
      available = post ? await postTranslationPaths(post._id, locale, slug) : {[locale]: path}
    } else {
      const {data: page} = slug
        ? await sanityFetch({query: getPageQuery, params: {slug, language: locale}, stega: false})
        : await sanityFetch({query: homePageQuery, params: {id: settingsId(locale)}, stega: false})
      available = page?._id
        ? await translationPaths(page._id, locale, slug || null, !slug)
        : {[locale]: locale === 'es' ? '/es/' : '/'}
    }
  }

  return (
    <Navbar
      data={navigation}
      siteTitle={settingsResult.data?.title}
      locale={locale}
      availableLanguages={available}
    />
  )
}
