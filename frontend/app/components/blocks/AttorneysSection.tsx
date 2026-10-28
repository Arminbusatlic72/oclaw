import Link from 'next/link'
import {
  Facebook,
  Globe2,
  Instagram,
  Linkedin,
  Twitter,
  type LucideIcon,
} from 'lucide-react'
import SanityImage from '@/app/components/SanityImage'
import {collectionPath} from '@/lib/collection-routing'
import type {Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {attorneyListQuery} from '@/sanity/lib/queries'

type Block = {
  subtitle?: string | null
  heading?: string | null
  selectionMode?: string | null
  attorneys?: Array<{_ref?: string}> | null
  maximumItems?: number | null
  showSocialLinks?: boolean | null
  viewAllLabel?: string | null
  theme?: string | null
  anchor?: {current?: string} | null
}

type SocialLink = {label?: string | null; url?: string | null; _key?: string}

function socialIcon(label: string): LucideIcon {
  const value = label.toLowerCase()
  if (value.includes('facebook')) return Facebook
  if (value.includes('instagram')) return Instagram
  if (value.includes('linkedin')) return Linkedin
  if (value === 'x' || value.includes('twitter')) return Twitter
  return Globe2
}

function AttorneySocialLinks({links}: {links?: SocialLink[] | null}) {
  const visible = links?.filter((item) => item.label && item.url) ?? []
  if (!visible.length) return null

  return (
    <ul className="attorneys-showcase-social" aria-label="Social links">
      {visible.map((item) => {
        const Icon = socialIcon(item.label!)
        return (
          <li key={item._key || item.url}>
            <a href={item.url!} target="_blank" rel="noopener noreferrer" aria-label={item.label!}>
              <Icon aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default async function AttorneysSection({block, locale}: {block: Block; locale: Locale}) {
  const {data: allAttorneys} = await sanityFetch({
    query: attorneyListQuery,
    params: {language: locale},
    perspective: 'published',
    stega: false,
  })
  const limit = Math.min(8, Math.max(1, block.maximumItems || 4))
  const byId = new Map(allAttorneys.map((attorney) => [attorney._id, attorney]))
  const selected =
    block.selectionMode === 'manual'
      ? (block.attorneys ?? [])
          .map((reference) => (reference._ref ? byId.get(reference._ref) : undefined))
          .filter((attorney): attorney is (typeof allAttorneys)[number] => Boolean(attorney))
          .slice(0, limit)
      : allAttorneys.slice(0, limit)
  const isLight = block.theme === 'light'

  return (
    <section
      id={block.anchor?.current || undefined}
      className={`attorneys-showcase ${isLight ? 'attorneys-showcase-light' : ''}`}
    >
      <div className="container">
        <header className="attorneys-showcase-header">
          {block.subtitle && <p className="site-block-eyebrow">{block.subtitle}</p>}
          <h2 className="site-block-heading">{block.heading}</h2>
          <span aria-hidden="true" />
        </header>

        {selected.length ? (
          <div className="attorneys-showcase-grid">
            {selected.map((person) => {
              if (!person.slug || !person.fullName) return null
              const href = collectionPath('attorney', locale, person.slug)
              return (
                <article className="attorneys-showcase-card" key={person._id}>
                  <Link className="attorneys-showcase-photo-link" href={href} aria-label={person.fullName}>
                    {person.profileImage?.asset?._ref ? (
                      <SanityImage
                        id={person.profileImage.asset._ref}
                        alt={person.profileImage.alt || person.fullName}
                        width={720}
                        className="attorneys-showcase-photo"
                      />
                    ) : (
                      <span className="attorneys-showcase-photo-empty" aria-hidden="true" />
                    )}
                  </Link>
                  <div className="attorneys-showcase-overlay" aria-hidden="true" />
                  <div className="attorneys-showcase-content">
                    <h3><Link href={href}>{person.fullName}</Link></h3>
                    {person.professionalTitle && <p>{person.professionalTitle}</p>}
                    {block.showSocialLinks !== false && <AttorneySocialLinks links={person.socialLinks} />}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="attorneys-showcase-empty" role="status">
            {locale === 'es'
              ? 'Próximamente publicaremos nuestros perfiles de abogados.'
              : 'Attorney profiles will be published soon.'}
          </p>
        )}

        {block.viewAllLabel && (
          <div className="attorneys-showcase-view-all">
            <Link href={collectionPath('attorney', locale)}>{block.viewAllLabel}</Link>
          </div>
        )}
      </div>
    </section>
  )
}
