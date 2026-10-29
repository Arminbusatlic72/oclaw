import {ExternalLink} from 'lucide-react'
import Link from 'next/link'

import {collectionPath} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type Block = ExtractPageBuilderType<'locationMap'>

function address(office: NonNullable<Block['offices']>[number]) {
  return [office.streetAddress, office.addressLine2, [office.city, office.state, office.postalCode].filter(Boolean).join(' '), office.country].filter(Boolean).join(', ')
}

export default function LocationMap({block, locale}: {block: Block; locale: Locale}) {
  const offices = (block.offices || []).filter((office) => office && office.language === locale)
  if (!offices.length) return null
  const height = Math.min(900, Math.max(320, block.mapHeight || 520))
  return <section className="location-map-section" aria-label={block.heading || (locale === 'es' ? 'Ubicaciones' : 'Locations')}>
    {block.heading && <div className="container"><h2 className="contact-section-heading">{block.heading}</h2></div>}
    <div className="location-map-grid" data-count={offices.length}>
      {offices.map((office) => {
        const officeAddress = address(office)
        const src = block.embedUrl && offices.length === 1 ? block.embedUrl : `https://www.google.com/maps?q=${encodeURIComponent(officeAddress)}&output=embed`
        return <article className="location-map-item" key={office._id} style={{'--map-height': `${height}px`} as React.CSSProperties}>
          <iframe src={src} title={`${office.name} — ${officeAddress}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          <div className="location-map-label">
            <div><h3>{office.name}</h3><address>{officeAddress}</address>{office.attorneys?.length ? <p className="location-map-attorneys"><span>{locale === 'es' ? 'Abogados: ' : 'Attorneys: '}</span>{office.attorneys.map((attorney, index) => <span key={attorney._id}>{index > 0 && ', '}{attorney.slug ? <Link href={collectionPath('attorney', locale, attorney.slug)}>{attorney.fullName}</Link> : attorney.fullName}</span>)}</p> : null}</div>
            {office.mapUrl && <a href={office.mapUrl} target="_blank" rel="noreferrer">{block.mapLinkLabel || (locale === 'es' ? 'Abrir mapa' : 'Open map')}<ExternalLink size={16} aria-hidden="true" /></a>}
          </div>
        </article>
      })}
    </div>
  </section>
}
