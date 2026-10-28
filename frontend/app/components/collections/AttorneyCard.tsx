import Link from 'next/link'
import SanityImage from '@/app/components/SanityImage'
import {collectionPath} from '@/lib/collection-routing'
import type {Locale} from '@/lib/i18n'

export type AttorneyCardData = {
  _id: string
  fullName: string | null
  slug: string | null
  professionalTitle?: string | null
  profileImage?: {asset?: {_ref?: string | null} | null; alt?: string | null} | null
  shortBiography?: string | null
  socialLinks?: Array<{_key?: string; label?: string | null; url?: string | null}> | null
}

export default function AttorneyCard({person, locale}: {person: AttorneyCardData; locale: Locale}) {
  if (!person.slug || !person.fullName) return null
  const href = collectionPath('attorney', locale, person.slug)
  return <article className="attorney-card">
    <Link href={href} className="attorney-card-portrait" aria-label={person.fullName}>
      {person.profileImage?.asset?._ref
        ? <SanityImage id={person.profileImage.asset._ref} alt={person.profileImage.alt || person.fullName} width={720} className="attorney-card-photo" />
        : <span className="attorney-card-photo-empty" aria-hidden="true" />}
    </Link>
    <div className="attorney-card-content">
      {person.professionalTitle && <p className="attorney-card-role">{person.professionalTitle}</p>}
      <h3><Link href={href}>{person.fullName}</Link></h3>
      {person.shortBiography && <p className="attorney-card-intro">{person.shortBiography}</p>}
      {person.socialLinks?.length ? <div className="attorney-card-social">{person.socialLinks.filter((item) => item.url && item.label).map((item) => <a key={item._key || item.url || ''} href={item.url!} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div> : null}
    </div>
  </article>
}
