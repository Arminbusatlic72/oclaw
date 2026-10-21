import {HeroSliderSection} from '@/sanity/lib/types'

import HeroSliderClient from './HeroSliderClient'

type HeroSliderProps = {
  block: HeroSliderSection
}

export default function HeroSlider({block}: HeroSliderProps) {
  const slides = block.slides ?? []
  if (!slides.length) {
    return null
  }

  return (
    <section className="site-hero" aria-label="Hero slider">
      <HeroSliderClient
        slides={slides}
        autoplay={block.autoplay ?? true}
        autoplayInterval={block.autoplayInterval ?? 5000}
        showDots={block.showDots ?? true}
        showArrows={block.showArrows ?? true}
      />
    </section>
  )
}
