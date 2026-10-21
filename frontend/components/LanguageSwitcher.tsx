'use client'

import Link from 'next/link'
import {usePathname, useRouter} from 'next/navigation'
import {Globe2} from 'lucide-react'
import {useEffect, useRef} from 'react'

import {dictionary, type Locale} from '@/lib/i18n'

function normalizePath(path: string) {
  const pathname = path.split(/[?#]/, 1)[0] || '/'
  return pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`
}

export default function LanguageSwitcher({
  locale,
  available,
  onNavigate,
}: {
  locale: Locale
  available: Partial<Record<Locale, string>>
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const previousPathname = useRef(pathname)
  const currentHref = available[locale]
  const dataMatchesPath = Boolean(
    currentHref && normalizePath(currentHref) === normalizePath(pathname),
  )

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    router.refresh()
  }, [pathname, router])

  return (
    <nav
      aria-label={dictionary[locale].language}
      className="flex items-center gap-1 text-xs font-bold tracking-wide"
    >
      <Globe2 aria-hidden="true" className="mr-1 hidden h-4 w-4 text-brand sm:block" />
      {(['en', 'es'] as const).map((language) => {
        const href =
          language === locale
            ? dataMatchesPath
              ? available[language]
              : pathname
            : dataMatchesPath
              ? available[language]
              : undefined
        const label = language.toUpperCase()
        if (!href) {
          return (
            <span
              key={language}
              role="link"
              aria-disabled="true"
              tabIndex={0}
              title={dictionary[locale].unavailable}
              aria-label={`${language === 'en' ? 'English' : 'Español'} — ${dictionary[locale].unavailable}`}
              className="cursor-not-allowed border border-white/25 px-2 py-1 text-white/45 line-through"
            >
              {label}
            </span>
          )
        }
        return (
          <Link
            key={language}
            href={href}
            hrefLang={language}
            lang={language}
            aria-current={locale === language ? 'page' : undefined}
            aria-label={language === 'en' ? 'English' : 'Español'}
            className={`px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${locale === language ? 'active border-b border-brand text-brand' : 'text-white/75 hover:text-brand'}`}
            onClick={(event) => {
              const isModifiedClick =
                event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
              if (isModifiedClick) return

              event.preventDefault()
              if (language === locale) return

              onNavigate?.()
              window.location.assign(`${href}${window.location.search}`)
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
