'use client'

import Link from 'next/link'
import Image from 'next/image'
import {useState} from 'react'
import {ChevronDown, Menu} from 'lucide-react'

import type {NavigationData, NavItem} from '@/lib/queries/navigation'
import {urlForImage} from '@/sanity/lib/utils'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
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
  if (item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative px-1 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
        onClick={onNavigate}
      >
        {item.title}
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-slate-900 transition-all duration-300 group-hover:w-full dark:bg-slate-100" />
      </a>
    )
  }

  const href = item.href || '#'
  return (
    <Link
      href={href}
      className="group relative px-1 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
      onClick={onNavigate}
    >
      {item.title}
      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-slate-900 transition-all duration-300 group-hover:w-full dark:bg-slate-100" />
    </Link>
  )
}

function MobileNavItem({item, onNavigate}: {item: NavItem; onNavigate: () => void}) {
  if (item.children && item.children.length > 0) {
    return (
      <details className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100">
          {item.title}
          <ChevronDown className="h-4 w-4" />
        </summary>
        <ul className="mt-3 space-y-2 pl-2">
          {item.children.map((child) => (
            <li key={`${item.title}-${child.title}`}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    )
  }

  if (item.isButton) {
    if (item.externalUrl) {
      return (
        <Button asChild variant="outline" className="w-full justify-start" onClick={onNavigate}>
          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </Button>
      )
    }

    return (
      <Button asChild variant="outline" className="w-full justify-start" onClick={onNavigate}>
        <Link href={item.href || '#'}>{item.title}</Link>
      </Button>
    )
  }

  return <NavLink item={item} onNavigate={onNavigate} />
}

export default function Navbar({
  data,
  siteTitle = 'Sanity + Next.js',
  locale,
  availableLanguages,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const logoUrl = data.logo
    ? urlForImage(data.logo)?.width(180).height(56).fit('max').url()
    : undefined

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-zinc-900/80">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={localePath(locale)}
          className="flex items-center"
          aria-label={dictionary[locale].home}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={data.logo?.alt || siteTitle}
              width={180}
              height={56}
              className="h-auto max-h-12 w-auto"
              priority
            />
          ) : (
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {siteTitle}
            </span>
          )}
        </Link>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {data.navItems.map((item) => {
                const hasChildren = Boolean(item.children && item.children.length > 0)

                return (
                  <NavigationMenuItem key={item.title}>
                    {hasChildren ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label={`${item.title} menu`}
                            className="group inline-flex items-center gap-1 px-1 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                          >
                            {item.title}
                            <ChevronDown className="h-4 w-4" />
                            <span className="absolute h-0.5 w-0 self-end bg-slate-900 transition-all duration-300 group-hover:w-full dark:bg-slate-100" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {item.children?.map((child) => (
                            <DropdownMenuItem key={`${item.title}-${child.title}`} asChild>
                              <Link href={child.href}>{child.title}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : item.isButton ? (
                      item.externalUrl ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link href={item.href || '#'}>{item.title}</Link>
                        </Button>
                      )
                    ) : (
                      <NavLink item={item} />
                    )}
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {data.ctaLabel && data.ctaHref && (
            <Button asChild>
              <Link href={data.ctaHref}>{data.ctaLabel}</Link>
            </Button>
          )}
          <LanguageSwitcher locale={locale} available={availableLanguages} />
        </div>

        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent aria-label="Mobile navigation">
              <div className="mt-8 flex h-full flex-col">
                <LanguageSwitcher
                  locale={locale}
                  available={availableLanguages}
                  onNavigate={() => setMobileOpen(false)}
                />
                <nav className="space-y-3" aria-label="Mobile main navigation">
                  {data.navItems.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </nav>
                {data.ctaLabel && data.ctaHref && (
                  <div className="mt-auto pt-6">
                    <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link href={data.ctaHref}>{data.ctaLabel}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
