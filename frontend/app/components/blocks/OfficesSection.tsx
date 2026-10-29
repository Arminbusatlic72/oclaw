import {ArrowRight, MapPin, Phone} from 'lucide-react'
import Link from 'next/link'

import SanityImage from '@/app/components/SanityImage'
import {collectionPath} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'
import {sanityFetch} from '@/sanity/lib/live'
import {officeListQuery} from '@/sanity/lib/queries'

type Block = ExtractPageBuilderType<'officesSection'>

export default async function OfficesSection({block, locale}: {block: Block; locale: Locale}) {
  const {data: all} = await sanityFetch({query: officeListQuery, params: {language: locale}, perspective: 'published', stega: false})
  const maximum = Math.min(12, Math.max(1, block.maximumItems || 3))
  const selectedIds = (block.offices || []).map((reference) => reference._ref)
  const offices = (block.selectionMode === 'manual'
    ? selectedIds.map((id) => all.find((office) => office._id === id)).filter((office): office is NonNullable<typeof office> => Boolean(office))
    : all).slice(0, maximum)
  const dark = block.theme !== 'light'

  return <section id={block.anchor?.current || undefined} className={`home-offices-section ${dark ? 'home-offices-dark' : 'home-offices-light'}`}>
    <div className="container">
      <header className="home-offices-header">
        <div>{block.subtitle && <p className="site-eyebrow">{block.subtitle}</p>}<h2 className="site-block-heading">{block.heading}</h2></div>
        {block.description && <p className="site-block-subheading">{block.description}</p>}
      </header>
      {offices.length ? <div className="home-offices-grid">
        {offices.map((office, index) => {
          const href = collectionPath('office', locale, office.slug)
          const locality = [office.city, office.state, office.postalCode].filter(Boolean).join(', ')
          const address = [office.streetAddress, office.addressLine2, locality].filter(Boolean)
          return <article className="home-office-card" key={office._id}>
            <Link className="home-office-visual" href={href} aria-label={office.name || undefined}>
              {office.image?.asset?._ref ? <SanityImage id={office.image.asset._ref} alt={office.image.alt || office.name || ''} width={900} className="home-office-image" /> : <span className="home-office-image-fallback"><MapPin size={44} strokeWidth={1.3} /></span>}
              <span className="home-office-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            </Link>
            <div className="home-office-content">
              <h3><Link href={href}>{office.name}</Link></h3>
              {address.length ? <address><MapPin size={18} aria-hidden="true" /><span>{address.map((line) => <span key={line}>{line}</span>)}</span></address> : null}
              {office.phone && <a className="home-office-phone" href={`tel:${office.phone.replace(/[^\d+]/g, '')}`}><Phone size={17} aria-hidden="true" />{office.phone}</a>}
              {block.showAttorneys !== false && office.attorneys?.length ? <div className="home-office-attorneys"><span>{locale === 'es' ? 'Abogados' : 'Attorneys'}</span>{office.attorneys.map((attorney) => attorney.slug ? <Link href={collectionPath('attorney', locale, attorney.slug)} key={attorney._id}>{attorney.fullName}</Link> : <span key={attorney._id}>{attorney.fullName}</span>)}</div> : null}
              <Link className="home-office-link" href={href}>{locale === 'es' ? 'Ver oficina' : 'View office'}<ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </article>
        })}
      </div> : <p className="practice-empty">{locale === 'es' ? 'Próximamente publicaremos nuestras oficinas.' : 'Our offices will be published soon.'}</p>}
      {block.viewAllLabel && <div className="home-offices-view-all"><Link className="site-button-outline" href={collectionPath('office', locale)}>{block.viewAllLabel}</Link></div>}
    </div>
  </section>
}
