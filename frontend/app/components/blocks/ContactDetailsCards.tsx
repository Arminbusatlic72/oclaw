import {Clock3, Mail, Phone} from 'lucide-react'

import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type Block = ExtractPageBuilderType<'contactDetailsCards'>

export const englishContactDetailsBlock: Block = {
  _type: 'contactDetailsCards',
  _key: 'english-contact-details-default',
  heading: 'We help solve your legal issues',
  emailTitle: 'Email',
  emailAddress: 'info@oclaw.us',
  phoneTitle: 'Phone',
  phoneNumbers: [
    {_key: 'miami', label: 'Miami', number: '+1 786 383 0297'},
    {_key: 'mt-prospect', label: 'Mt Prospect, Illinois', number: '+1 847 258 9954'},
    {_key: 'new-york', label: 'New York', number: '+1 347-305-7600'},
  ],
  hoursTitle: 'Working hours',
  hours: [
    'Monday to Friday: 9:00 a.m. to 5:00 p.m.',
    'Saturday: 10:00 a.m. to 1:00 p.m. (emergency calls only)',
    'Sunday: Closed',
  ],
}

export default function ContactDetailsCards({block}: {block: Block}) {
  return <section className="contact-cards-section" aria-label={block.heading}>
    <div className="container">
      <h2 className="contact-section-heading">{block.heading}</h2>
      <div className="contact-cards-grid">
        <article className="contact-info-card" data-index="01">
          <span className="contact-card-icon" aria-hidden="true"><Mail size={34} strokeWidth={1.8} /></span>
          <h3>{block.emailTitle}</h3>
          <div className="contact-card-lines"><a href={`mailto:${block.emailAddress}`}>{block.emailAddress}</a></div>
        </article>
        <article className="contact-info-card" data-index="02">
          <span className="contact-card-icon" aria-hidden="true"><Phone size={34} strokeWidth={1.8} /></span>
          <h3>{block.phoneTitle}</h3>
          <div className="contact-card-lines">
            {block.phoneNumbers.map((phone) => <p key={phone._key}>{phone.label}: <a href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}>{phone.number}</a></p>)}
          </div>
        </article>
        <article className="contact-info-card" data-index="03">
          <span className="contact-card-icon" aria-hidden="true"><Clock3 size={34} strokeWidth={1.8} /></span>
          <h3>{block.hoursTitle}</h3>
          <div className="contact-card-lines">{block.hours.map((line) => <p key={line}>{line}</p>)}</div>
        </article>
      </div>
    </div>
  </section>
}