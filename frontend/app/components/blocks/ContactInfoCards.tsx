import {Mail, MapPin, Phone} from 'lucide-react'
import Link from 'next/link'

import {collectionPath} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type Block = ExtractPageBuilderType<'contactInfoCards'>
type Card = NonNullable<Block['cards']>[number]

function officeAddress(office: NonNullable<Card['office']>) {
  const locality = [office.city, office.state, office.postalCode].filter(Boolean).join(', ').replace(/, (\d)/, ' $1')
  return [office.streetAddress, office.addressLine2, locality, office.country].filter(Boolean) as string[]
}

function contactLines(card: Card) {
  if (!card.office) return card.content?.filter(Boolean) as string[] | undefined
  if (card.icon === 'phone') return card.office.phone ? [card.office.phone] : []
  if (card.icon === 'email') return card.office.email ? [card.office.email] : []
  return officeAddress(card.office)
}

function primaryHref(card: Card) {
  if (card.link?.linkType === 'page' && typeof card.link.page === 'string') return card.link.page
  if (card.link?.href) return card.link.href
  if (card.icon === 'phone' && card.office?.phone) return `tel:${card.office.phone.replace(/[^\d+]/g, '')}`
  if (card.icon === 'email' && card.office?.email) return `mailto:${card.office.email}`
  if (card.icon === 'address' && card.office?.mapUrl) return card.office.mapUrl
  return null
}

export default function ContactInfoCards({block, locale}: {block: Block; locale: Locale}) {
  const cards = block.cards || []
  if (!cards.length) return null
  return (
    <section className="contact-cards-section" aria-label={block.heading || (locale === 'es' ? 'Información de contacto' : 'Contact information')}>
      <div className="container">
        {block.heading && <h2 className="contact-section-heading">{block.heading}</h2>}
        <div className="contact-cards-grid">
          {cards.map((card, index) => {
            const Icon = card.icon === 'phone' ? Phone : card.icon === 'email' ? Mail : MapPin
            const lines = contactLines(card) || []
            const href = primaryHref(card)
            return <article className="contact-info-card" data-index={String(index + 1).padStart(2, '0')} key={card._key}>
              <span className="contact-card-icon" aria-hidden="true"><Icon size={34} strokeWidth={1.8} /></span>
              <h3>{card.title}</h3>
              {card.office?.name && <p className="contact-card-office">{card.office.name}</p>}
              <div className="contact-card-lines">
                {lines.map((line, index) => href && lines.length === 1 ? <a href={href} key={`${line}-${index}`} target={card.link?.openInNewTab ? '_blank' : undefined} rel={card.link?.openInNewTab ? 'noreferrer' : undefined}>{line}</a> : <p key={`${line}-${index}`}>{line}</p>)}
              </div>
              {card.icon === 'address' && card.office?.attorneys?.length ? <div className="contact-card-attorneys"><span>{locale === 'es' ? 'Abogados' : 'Attorneys'}</span>{card.office.attorneys.map((attorney) => attorney.slug ? <Link href={collectionPath('attorney', locale, attorney.slug)} key={attorney._id}>{attorney.fullName}</Link> : <span key={attorney._id}>{attorney.fullName}</span>)}</div> : null}
              {href && (card.linkLabel || lines.length !== 1) && <a className="contact-card-link" href={href} target={card.link?.openInNewTab ? '_blank' : undefined} rel={card.link?.openInNewTab ? 'noreferrer' : undefined}>{card.linkLabel || (locale === 'es' ? 'Ver ubicación' : 'View location')}</a>}
            </article>
          })}
        </div>
      </div>
    </section>
  )
}
