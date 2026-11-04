import {navigationId, safeLegacyUrl, type Locale} from '@/lib/i18n'
import {localizeContent} from '@/lib/localized-content'
import {sanityFetch} from '@/sanity/lib/live'
import {navigationQuery} from '@/sanity/lib/queries'
import type {DereferencedLink} from '@/sanity/lib/types'

export interface NavChild {
  title: string
  href?: string
  link?: DereferencedLink
}

export interface NavItem {
  title: string
  href?: string
  externalUrl?: string
  isButton?: boolean
  children?: NavChild[]
  link?: DereferencedLink
}

export interface NavigationData {
  logo?: {
    alt?: string
    asset?: {
      _id?: string
      metadata?: {dimensions?: {aspectRatio?: number} | null} | null
    }
  }
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
  ctaLink?: DereferencedLink
}

type LinkInput = DereferencedLink
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
    if (typeof resolved === 'string' && resolved.trim()) return safeLegacyUrl(resolved, locale)
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
        return child.title && (href || child.link?.linkType === 'calendly')
          ? [{title: child.title, href: href || '#', link: child.link as DereferencedLink}]
          : []
      })
      const href = chooseLink(item.link, item.href, locale)
      const externalUrl = item.externalUrl ?? undefined
      if (!href && !externalUrl && item.link?.linkType !== 'calendly' && children.length === 0) return []
      return [
        {
          title: item.title,
          href: href ?? undefined,
          externalUrl,
          isButton: item.isButton ?? false,
          children,
          link: item.link as DereferencedLink | undefined,
        },
      ]
    }),
    ctaLabel: localized.ctaLabel ?? undefined,
    ctaHref: chooseLink(localized.ctaLink, localized.ctaHref, locale) ?? undefined,
    ctaLink: localized.ctaLink as DereferencedLink | undefined,
  }
}
