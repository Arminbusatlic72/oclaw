import Link from 'next/link'

import {dictionary, footerId, type Locale} from '@/lib/i18n'
import {localizeContent} from '@/lib/localized-content'
import {footerQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {linkResolver} from '@/sanity/lib/utils'

export default async function Footer({locale}: {locale: Locale}) {
  const {data} = await sanityFetch({query: footerQuery, params: {id: footerId(locale)}})
  const footer = data ? await localizeContent(data, locale) : null
  const labels = dictionary[locale]

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container py-10">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {footer?.heading || labels.footerHeading}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {footer?.description || labels.footerDescription}
            </p>
            {footer?.copyright && <p className="mt-2 text-xs text-slate-500">{footer.copyright}</p>}
          </div>
          <nav
            className="flex flex-wrap items-center justify-center gap-3 md:justify-end"
            aria-label="Footer"
          >
            {footer?.links?.map((item) => {
              const href = linkResolver(item.link)
              if (!href || !item.label) return null
              return (
                <Link
                  key={item._key}
                  href={href}
                  target={item.link?.openInNewTab ? '_blank' : undefined}
                  rel={item.link?.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
