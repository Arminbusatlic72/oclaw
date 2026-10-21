import FooterBlock from '@/app/components/footer/FooterBlock'
import FooterLinks from '@/app/components/footer/FooterLinks'
import type {FooterData, FooterLinkItem} from '@/app/components/footer/types'
import {footerId, type Locale} from '@/lib/i18n'
import {localizeContent} from '@/lib/localized-content'
import {footerQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Footer({locale}: {locale: Locale}) {
  const {data} = await sanityFetch({query: footerQuery, params: {id: footerId(locale)}})
  const footer = data ? ((await localizeContent(data, locale)) as FooterData) : null
  if (!footer) return null

  const blocks = footer.blocks ?? []
  const hasLegacyContent = !blocks.length && Boolean(footer.heading || footer.description)
  const bottomLinks = (blocks.length ? footer.bottomLinks || footer.links : footer.bottomLinks) as
    | FooterLinkItem[]
    | null
  const copyright = footer.includeCurrentYear
    ? `© ${new Date().getFullYear()}${footer.copyright ? ` ${footer.copyright}` : ''}`
    : footer.copyright
  const hasBottomRow = Boolean(copyright || bottomLinks?.length)
  if (!blocks.length && !hasLegacyContent && !footer.links?.length && !hasBottomRow) return null

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="container py-12">
        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {blocks.map((block) => (
              <FooterBlock key={block._key} block={block} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {hasLegacyContent && (
              <div>
                {footer.heading && (
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {footer.heading}
                  </h2>
                )}
                {footer.description && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {footer.description}
                  </p>
                )}
              </div>
            )}
            {footer.links?.length ? (
              <nav aria-label={footer.heading || undefined} className="md:justify-self-end">
                <FooterLinks links={footer.links as FooterLinkItem[]} />
              </nav>
            ) : null}
          </div>
        )}

        {hasBottomRow && (
          <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:text-slate-400">
            {copyright && <p>{copyright}</p>}
            {bottomLinks?.length ? (
              <nav aria-label={footer.bottomLinksLabel || undefined}>
                <FooterLinks links={bottomLinks} compact />
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  )
}
