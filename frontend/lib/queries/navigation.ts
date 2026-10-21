import {navigationId, safeLegacyUrl, type Locale} from '@/lib/i18n'
import {localizeContent} from '@/lib/localized-content'
import {sanityFetch} from '@/sanity/lib/live'
import {navigationQuery} from '@/sanity/lib/queries'

export interface NavChild {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href?: string
  externalUrl?: string
  isButton?: boolean
  children?: NavChild[]
}

export interface NavigationData {
  logo?: {
    alt?: string
    asset?: {
      _id?: string
      metadata?: {dimensions?: {aspectRatio?: number}}
    }
  }
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
}

type LinkInput = {linkType?: string; page?: string | null; href?: string | null}
type RawChild = {title?: string | null; href?: string | null; link?: LinkInput | null}
type RawItem = RawChild & {
  externalUrl?: string | null
  isButton?: boolean | null
  children?: RawChild[] | null
}
function chooseLink(
  link: LinkInput | null | undefined,
  fallback: string | null | undefined,
  locale: Locale,
) {
  if (link) {
    const resolved = link.linkType === 'page' ? link.page : link.href
    return typeof resolved === 'string' ? resolved : null
  }
  return safeLegacyUrl(fallback, locale)
}

export async function getNavigation(locale: Locale): Promise<NavigationData> {
  const {data} = await sanityFetch({query: navigationQuery, params: {id: navigationId(locale)}})
  if (!data) return {navItems: []}
  const localized = (await localizeContent(data, locale)) as typeof data & {
    navItems?: RawItem[] | null
    ctaLink?: LinkInput | null
  }
  const sharedLogo =
    locale === 'es' && !localized.logo
      ? (
          await sanityFetch({query: navigationQuery, params: {id: navigationId('en')}})
        ).data?.logo
      : null
  const logo = localized.logo ?? sharedLogo
  return {
    logo: logo
      ? {alt: logo.alt ?? undefined, asset: logo.asset ?? undefined}
      : undefined,
    navItems: (localized.navItems ?? []).flatMap((item: RawItem) => {
      if (!item?.title) return []
      const children = (item.children ?? []).flatMap((child: RawChild) => {
        const href = chooseLink(child.link, child.href, locale)
        return child.title && href ? [{title: child.title, href}] : []
      })
      const href = chooseLink(item.link, item.href, locale)
      const externalUrl = item.externalUrl ?? undefined
      if (!href && !externalUrl && children.length === 0) return []
      return [
        {
          title: item.title,
          href: href ?? undefined,
          externalUrl,
          isButton: item.isButton ?? false,
          children,
        },
      ]
    }),
    ctaLabel: localized.ctaLabel ?? undefined,
    ctaHref: chooseLink(localized.ctaLink, localized.ctaHref, locale) ?? undefined,
  }
}
