import Link from 'next/link'

import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type PageHeroBlock = ExtractPageBuilderType<'pageHero'>

export default function PageHero({block, locale}: {block: PageHeroBlock; locale: Locale}) {
  const homePath = locale === 'es' ? '/es/' : '/'
  const homeLabel = locale === 'es' ? 'Inicio' : 'Home'

  return (
    <header className="about-hero">
      <div className="container about-hero-inner">
        {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
        <h1>{block.heading}</h1>
        {block.showBreadcrumb !== false && (
          <nav aria-label="Breadcrumb" className="about-breadcrumb">
            <Link href={homePath}>{homeLabel}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{block.heading}</span>
          </nav>
        )}
      </div>
    </header>
  )
}
