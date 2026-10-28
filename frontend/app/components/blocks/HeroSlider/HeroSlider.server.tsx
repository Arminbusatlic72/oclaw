import {collectionPath, selectedPracticeAreas} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {practiceAreasQuery} from '@/sanity/lib/queries'
import {HeroSliderSection, type HeroPracticeArea} from '@/sanity/lib/types'

import HeroSliderClient from './HeroSliderClient'

type HeroSliderProps = {
  block: HeroSliderSection
  locale?: Locale
}

export default async function HeroSlider({block, locale = 'en'}: HeroSliderProps) {
  const slides = block.slides ?? []
  if (!slides.length) {
    return null
  }

  const shouldLoadPracticeAreas =
    (block.layout ?? 'classic') === 'classic' &&
    block.showPracticeAreas === true
  let practiceAreas: HeroPracticeArea[] = []

  if (shouldLoadPracticeAreas) {
    const {data: all} = await sanityFetch({
      query: practiceAreasQuery,
      params: {language: locale},
      perspective: 'published',
      stega: false,
    })
    const selected = await selectedPracticeAreas(
      all,
      locale,
      block.practiceAreasSelectionMode,
      block.practiceAreas,
      block.maximumPracticeAreas,
    )
    practiceAreas = selected.flatMap((area) =>
      area.title && area.slug
        ? [{_id: area._id, title: area.title, href: collectionPath('practiceArea', locale, area.slug)}]
        : [],
    )
  }

  return (
    <section className="site-hero" aria-label={locale === 'es' ? 'Carrusel principal' : 'Hero slider'}>
      <HeroSliderClient
        slides={slides}
        locale={locale}
        layout={block.layout ?? 'classic'}
        enhancedClassic={block.enhancedClassic ?? false}
        showAwardBadge={block.showAwardBadge ?? true}
        practiceAreas={practiceAreas}
        practiceAreasHeading={
          block.practiceAreasHeading || (locale === 'es' ? 'Áreas de práctica' : 'Practice Areas')
        }
        autoplay={block.autoplay ?? true}
        autoplayInterval={block.autoplayInterval ?? 5000}
        showDots={block.showDots ?? true}
        showArrows={block.showArrows ?? true}
      />
    </section>
  )
}
