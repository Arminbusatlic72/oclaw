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
    <section
      className="relative overflow-hidden bg-slate-950/80 text-white"
      aria-label="Hero slider"
    >
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <HeroSliderClient
          slides={slides}
          autoplay={block.autoplay ?? true}
          autoplayInterval={block.autoplayInterval ?? 5000}
          showDots={block.showDots ?? true}
          showArrows={block.showArrows ?? true}
        />
      </div>
    </section>
  )
}
