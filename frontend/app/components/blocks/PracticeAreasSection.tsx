import Link from 'next/link'
import {collectionPath, selectedPracticeAreas} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {practiceAreasQuery} from '@/sanity/lib/queries'
import PracticeAreaCard from '@/app/components/collections/PracticeAreaCard'

type Block = {subtitle?: string | null; heading?: string | null; description?: string | null; theme?: string | null; selectionMode?: string | null; practiceAreas?: Array<{_ref?: string}> | null; maximumItems?: number | null; viewAllLabel?: string | null; anchor?: {current?: string} | null}

export default async function PracticeAreasSection({block, locale}: {block: Block; locale: Locale}) {
  const {data: all} = await sanityFetch({query: practiceAreasQuery, params: {language: locale}, perspective: 'published', stega: false})
  const areas = await selectedPracticeAreas(all, locale, block.selectionMode, block.practiceAreas, block.maximumItems)
  const dark = block.theme !== 'light'
  return <section id={block.anchor?.current || undefined} className={`practice-section ${dark ? 'practice-section-dark' : 'practice-section-light'}`}>
    <div className="container">
      <header className="practice-section-header">{block.subtitle && <p className="practice-eyebrow site-block-eyebrow">{block.subtitle}</p>}<h2 className="site-block-heading">{block.heading}</h2><span className="practice-divider" aria-hidden="true" />{block.description && <p className="site-block-subheading">{block.description}</p>}</header>
      {areas.length ? <div className="practice-card-grid">{areas.map((area) => <PracticeAreaCard key={area._id} area={area} locale={locale} />)}</div> : <p className="practice-empty">{locale === 'es' ? 'Próximamente publicaremos nuestras áreas de práctica.' : 'Practice areas will be published soon.'}</p>}
      {block.viewAllLabel && <div className="practice-view-all"><Link href={collectionPath('practiceArea', locale)}>{block.viewAllLabel}</Link></div>}
    </div>
  </section>
}
