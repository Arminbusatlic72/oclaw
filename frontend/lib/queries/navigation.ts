import {defineQuery} from 'next-sanity'

import {client} from '@/sanity/lib/client'

/** Represents a nested navigation child link. */
export interface NavChild {
  title: string
  href: string
}

/** Represents a top-level navigation item. */
export interface NavItem {
  title: string
  href?: string
  externalUrl?: string
  isButton?: boolean
  children?: NavChild[]
}

/** Represents the full navigation payload used by the Navbar. */
export interface NavigationData {
  logo?: {
    alt?: string
    asset?: {
      _ref?: string
      url?: string
    }
  }
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
}

export const navigationQuery = defineQuery(`
  *[_type == "navigation" && _id == "siteNavigation"][0]{
    logo{
      alt,
      asset->{
        _ref,
        url
      }
    },
    navItems[]{
      title,
      href,
      externalUrl,
      isButton,
      children[]{
        title,
        href
      }
    },
    ctaLabel,
    ctaHref
  }
`)

/** Fetches and normalizes the global navigation document from Sanity. */
export async function getNavigation(): Promise<NavigationData> {
  const data = await client.fetch<NavigationData | null>(navigationQuery)
  return {
    logo: data?.logo,
    navItems: data?.navItems ?? [],
    ctaLabel: data?.ctaLabel,
    ctaHref: data?.ctaHref,
  }
}
