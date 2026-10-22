'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import Image from 'next/image'

import {HeroSliderSlide} from '@/sanity/lib/types'
import {linkResolver, urlForImage} from '@/sanity/lib/utils'

type HeroSliderClientProps = {
  slides: HeroSliderSlide[]
  autoplay: boolean
  autoplayInterval: number
  showDots: boolean
  showArrows: boolean
}

const sizes = '(max-width: 1279px) 100vw, 60vw'

export default function HeroSliderClient({
  slides,
  autoplay,
  autoplayInterval,
  showDots,
  showArrows,
}: HeroSliderClientProps) {
  const preparedSlides = useMemo(() => {
    return slides
      ?.map((slide, index) => ({
        ...slide,
        id: slide._key ?? `hero-slide-${index}`,
        imageUrl: slide.image
          ? urlForImage(slide.image)?.width(1800).auto('format').url()
          : undefined,
      }))
      .filter((slide) => slide.title || slide.subtitle || slide.description || slide.imageUrl)
  }, [slides])

  const [currentIndex, setCurrentIndex] = useState(0)

  const slideCount = preparedSlides.length
  const intervalMs = Math.max(1000, autoplayInterval ?? 5000)

  useEffect(() => {
    if (!autoplay || slideCount <= 1) {
      return
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [autoplay, intervalMs, slideCount])

  const handlePrev = useCallback(() => {
    if (slideCount <= 1) return
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  const handleNext = useCallback(() => {
    if (slideCount <= 1) return
    setCurrentIndex((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  if (!slideCount) {
    return null
  }

  return (
    <div className="relative w-full" role="region" aria-roledescription="carousel">
      <div className="overflow-hidden">
        <div
          className="flex w-full transition-transform duration-700 ease-in-out"
          style={{transform: `translateX(-${currentIndex * 100}%)`}}
        >
          {preparedSlides.map((slide, index) => {
            const isActive = index === currentIndex
            const ctaHref = linkResolver(slide.cta?.link) || slide.cta?.url
            const isExternalCta = Boolean(ctaHref?.match(/^https?:\/\//))
            const secondaryCtaHref =
              linkResolver(slide.secondaryCta?.link) || slide.secondaryCta?.url
            const isExternalSecondaryCta = Boolean(secondaryCtaHref?.match(/^https?:\/\//))
            return (
              <article key={slide.id} className="site-hero-slide w-full shrink-0" aria-hidden={!isActive}>
                {slide.imageUrl && (
                  <div className="site-hero-image">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.image?.alt || slide.title || 'Hero slide image'}
                      fill
                      sizes={sizes}
                      priority={index === 0}
                      loading={index === 0 ? undefined : 'lazy'}
                      quality={85}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="site-hero-shade" />
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="site-hero-content flex flex-col gap-4"
                >
                  {slide.subtitle && (
                    <span className="site-eyebrow">
                      {slide.subtitle}
                    </span>
                  )}
                  {slide.title && (
                    <h2 className="site-hero-title text-white">
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="text-lg text-white/85">{slide.description}</p>
                  )}
                  {(slide.cta?.label || slide.secondaryCta?.label) && (
                    <div className="site-hero-actions">
                      {slide.cta?.label &&
                        (ctaHref ? (
                          <a
                            href={ctaHref}
                            target={isExternalCta ? '_blank' : undefined}
                            rel={isExternalCta ? 'noopener noreferrer' : undefined}
                            className="site-button-outline site-hero-cta"
                          >
                            {slide.cta.label}
                          </a>
                        ) : (
                          <span className="site-button-outline site-hero-cta" aria-disabled="true">
                            {slide.cta.label}
                          </span>
                        ))}
                      {slide.secondaryCta?.label &&
                        (secondaryCtaHref ? (
                          <a
                            href={secondaryCtaHref}
                            target={isExternalSecondaryCta ? '_blank' : undefined}
                            rel={isExternalSecondaryCta ? 'noopener noreferrer' : undefined}
                            className="site-button-outline site-button-secondary site-hero-cta"
                          >
                            {slide.secondaryCta.label}
                          </a>
                        ) : (
                          <span
                            className="site-button-outline site-button-secondary site-hero-cta"
                            aria-disabled="true"
                          >
                            {slide.secondaryCta.label}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {showArrows && slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Show previous slide"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-brand/70 bg-ink/70 p-2 text-white transition hover:bg-brand hover:text-ink"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Show next slide"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-brand/70 bg-ink/70 p-2 text-white transition hover:bg-brand hover:text-ink"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {showDots && slideCount > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
          {preparedSlides.map((_, dotIndex) => (
            <button
              key={`dot-${dotIndex}`}
              type="button"
              aria-label={`Show slide ${dotIndex + 1}`}
              onClick={() => setCurrentIndex(dotIndex)}
              className={`h-1.5 w-8 transition-all ${
                dotIndex === currentIndex ? 'bg-brand' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
