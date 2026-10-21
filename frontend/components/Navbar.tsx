'use client'

import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import {ChevronDown, Menu} from 'lucide-react'

import type {NavigationData, NavItem} from '@/lib/queries/navigation'
import {urlForImage} from '@/sanity/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {dictionary, localePath, type Locale} from '@/lib/i18n'

type NavbarProps = {
  data: NavigationData
  siteTitle?: string
  locale: Locale
  availableLanguages: Partial<Record<Locale, string>>
}

function NavLink({item, onNavigate}: {item: NavItem; onNavigate?: () => void}) {
  const className = 'site-header-link inline-flex items-center py-2'
  if (item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {item.title}
      </a>
    )
  }

  return (
    <Link href={item.href || '#'} className={className} onClick={onNavigate}>
      {item.title}
    </Link>
  )
}

function MobileNavItem({item, onNavigate}: {item: NavItem; onNavigate: () => void}) {
  if (item.children?.length) {
    return (
      <details className="border-b border-white/20 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-white">
          {item.title}
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </summary>
        <ul className="mt-3 space-y-3 pl-4">
          {item.children.map((child) => (
            <li key={`${item.title}-${child.title}`}>
              <Link href={child.href} onClick={onNavigate} className="text-sm text-white/75 hover:text-brand">
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    )
  }

  if (item.isButton) {
    return (
      <a
        href={item.externalUrl || item.href || '#'}
        target={item.externalUrl ? '_blank' : undefined}
        rel={item.externalUrl ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
        className="site-button-outline my-2 w-full"
      >
        {item.title}
      </a>
    )
  }

  return (
    <div className="border-b border-white/20 py-2">
      <NavLink item={item} onNavigate={onNavigate} />
    </div>
  )
}

export default function Navbar({
  data,
  siteTitle = 'Oclaw',
  locale,
  availableLanguages,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHomepage = pathname === '/' || pathname === '/es' || pathname === '/es/'

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 16)
    updateScroll()
    window.addEventListener('scroll', updateScroll, {passive: true})
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  const logoUrl = data.logo
    ? urlForImage(data.logo)?.width(360).fit('max').url()
    : undefined
  const logoAspectRatio = data.logo?.asset?.metadata?.dimensions?.aspectRatio
  const isMarkOnly = Boolean(logoUrl && logoAspectRatio && logoAspectRatio < 2.4)
  const ctaAlreadyInNavigation = data.navItems.some(
    (item) => item.href === data.ctaHref || item.externalUrl === data.ctaHref,
  )

  return (
    <header className={`site-header${isHomepage ? ' site-header-home' : ''}${scrolled ? ' site-header-scrolled' : ''}`}>
      <div className="site-header-inner">
        <Link href={localePath(locale)} className="site-header-logo" aria-label={dictionary[locale].home}>
          {logoUrl ? (
            <>
              <span className={`site-header-logo-box${isMarkOnly ? ' site-header-logo-box-mark' : ''}`}>
                <Image
                  src={logoUrl}
                  alt={isMarkOnly ? '' : data.logo?.alt || siteTitle}
                  fill
                  sizes={isMarkOnly ? '80px' : '(max-width: 1279px) 160px, 240px'}
                  className="object-contain object-left"
                  priority
                />
              </span>
              {isMarkOnly && <span className="site-header-logo-name">{siteTitle}</span>}
            </>
          ) : (
            <span>{siteTitle}</span>
          )}
        </Link>

        <nav
          className="site-header-nav hidden xl:flex"
          aria-label={locale === 'es' ? 'Navegación principal' : 'Main navigation'}
        >
          {data.navItems.map((item) => {
            if (item.children?.length) {
              return (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="site-header-link inline-flex items-center gap-1 py-2">
                      {item.title}
                      <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={`${item.title}-${child.title}`} asChild>
                        <Link href={child.href}>{child.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            if (item.isButton) {
              return (
                <a
                  key={item.title}
                  href={item.externalUrl || item.href || '#'}
                  target={item.externalUrl ? '_blank' : undefined}
                  rel={item.externalUrl ? 'noopener noreferrer' : undefined}
                  className="site-header-link inline-flex items-center py-2"
                >
                  {item.title}
                </a>
              )
            }
            return <NavLink key={item.title} item={item} />
          })}
          {data.ctaLabel && data.ctaHref && !ctaAlreadyInNavigation && (
            <Link href={data.ctaHref} className="site-header-link inline-flex items-center py-2">
              {data.ctaLabel}
            </Link>
          )}
        </nav>

        <div className="site-header-actions site-header-actions-desktop">
          <LanguageSwitcher locale={locale} available={availableLanguages} />
        </div>

        <div className="site-header-menu xl:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={locale === 'es' ? 'Abrir navegación' : 'Open navigation'}
                className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand text-ink"
              >
                <Menu aria-hidden="true" className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              aria-label={locale === 'es' ? 'Navegación móvil' : 'Mobile navigation'}
              className="border-brand/30 bg-ink text-white [&>button]:text-white"
            >
              <div className="mt-10 flex h-full flex-col">
                <nav aria-label={locale === 'es' ? 'Navegación principal' : 'Main navigation'}>
                  {data.navItems.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </nav>
                {data.ctaLabel && data.ctaHref && (
                  <Link
                    href={data.ctaHref}
                    className="site-button-outline mt-8"
                    onClick={() => setMobileOpen(false)}
                  >
                    {data.ctaLabel}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="site-header-actions site-header-actions-mobile">
          <LanguageSwitcher locale={locale} available={availableLanguages} />
        </div>
      </div>
    </header>
  )
}
