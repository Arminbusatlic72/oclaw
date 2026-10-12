'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import Image from 'next/image'

import {HeroSliderSlide} from '@/sanity/lib/types'
import {urlForImage} from '@/sanity/lib/utils'

type HeroSliderClientProps = {
  slides: HeroSliderSlide[]
  autoplay: boolean
  autoplayInterval: number
  showDots: boolean
  showArrows: boolean
}

const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px'

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
          ? urlForImage(slide.image)?.width(1800).height(1000).fit('crop').auto('format').url()
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
            const isExternalCta = Boolean(slide.cta?.url?.match(/^https?:\/\//))
            return (
              <article key={slide.id} className="relative w-full shrink-0" aria-hidden={!isActive}>
                {slide.imageUrl && (
                  <div className="relative h-105 w-full sm:h-130">
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
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-6 py-10 text-white sm:px-12"
                >
                  {slide.subtitle && (
                    <span className="uppercase tracking-[0.35em] text-xs text-white/70">
                      {slide.subtitle}
                    </span>
                  )}
                  {slide.title && (
                    <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="max-w-3xl text-lg text-white/80">{slide.description}</p>
                  )}
                  {slide.cta?.label && slide.cta?.url && (
                    <a
                      href={slide.cta.url}
                      target={isExternalCta ? '_blank' : undefined}
                      rel={isExternalCta ? 'noreferrer' : undefined}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-white"
                    >
                      {slide.cta.label}
                      <span aria-hidden="true">→</span>
                    </a>
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
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/60 p-2 text-white transition hover:bg-slate-900"
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
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/60 p-2 text-white transition hover:bg-slate-900"
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
        <div className="mt-6 flex justify-center gap-2">
          {preparedSlides.map((_, dotIndex) => (
            <button
              key={`dot-${dotIndex}`}
              type="button"
              aria-label={`Show slide ${dotIndex + 1}`}
              onClick={() => setCurrentIndex(dotIndex)}
              className={`h-2 w-8 rounded-full transition-all ${
                dotIndex === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
