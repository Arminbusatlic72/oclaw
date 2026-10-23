import Link from 'next/link'
import Image from '@/app/components/SanityImage'
import {Scale} from 'lucide-react'
import {collectionPath} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'

export type PracticeAreaCardData = {_id: string; title: string | null; slug: string | null; shortDescription?: string | null; icon?: {asset?: {_ref?: string} | null; alt?: string | null} | null}
export default function PracticeAreaCard({area, locale}: {area: PracticeAreaCardData; locale: Locale}) {
  if (!area.slug) return null
  return <article className="practice-card"><Link href={collectionPath('practiceArea', locale, area.slug)} className="practice-card-link"><span className="practice-card-icon">{area.icon?.asset?._ref ? <Image id={area.icon.asset._ref} alt={area.icon.alt || ''} width={64} className="h-14 w-14 object-contain" /> : <Scale size={48} strokeWidth={1.3} aria-hidden="true" />}</span><h3>{area.title}</h3>{area.shortDescription && <p>{area.shortDescription}</p>}</Link></article>
}
