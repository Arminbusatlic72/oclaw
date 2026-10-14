'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Globe2} from 'lucide-react'

import {dictionary, type Locale} from '@/lib/i18n'

export default function LanguageSwitcher({
  locale,
  available,
  onNavigate,
}: {
  locale: Locale
  available: Partial<Record<Locale, string>>
  onNavigate?: () => void
}) {
  const router = useRouter()
  return (
    <nav
      aria-label={dictionary[locale].language}
      className="flex items-center gap-1 text-sm font-medium"
    >
      <Globe2 aria-hidden="true" className="mr-1 h-4 w-4 text-slate-500" />
      {(['en', 'es'] as const).map((language) => {
        const href = available[language]
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
              className="cursor-not-allowed rounded border border-dashed border-slate-300 px-2 py-1 text-slate-400 line-through dark:border-slate-700"
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
            className={`rounded px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${locale === language ? 'active bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200'}`}
            onClick={(event) => {
              onNavigate?.()
              const query = window.location.search
              if (query && language !== locale) {
                event.preventDefault()
                router.push(`${href}${query}`)
              }
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
