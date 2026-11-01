'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight, ExternalLink, Star} from 'lucide-react'
import {stegaClean} from '@sanity/client/stega'
import {useReducedMotion} from 'framer-motion'

import SanityImage from '@/app/components/SanityImage'
import type {GoogleReviewsPayload, PublicReview} from '@/lib/google-reviews'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type TestimonialsBlock = ExtractPageBuilderType<'testimonialsSection'>

type DisplayReview = {
  id: string
  authorName: string
  authorPhotoUrl?: string
  authorUrl?: string
  photo?: NonNullable<NonNullable<TestimonialsBlock['testimonials']>[number]>['photo']
  rating: number
  text: string
  detail?: string
  relativeTime?: string
  googleMapsUrl?: string
  source: 'google' | 'manual'
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function manualReviews(block: TestimonialsBlock): DisplayReview[] {
  return (block.testimonials || [])
    .filter((review) => review.quote && review.name)
    .map((review, index) => ({
      id: review._key || `manual-${index}`,
      authorName: review.name || 'Client',
      photo: review.photo,
      rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
      text: review.quote || '',
      detail: review.role,
      googleMapsUrl: review.sourceUrl,
      source: 'manual' as const,
    }))
}

function mapGoogleReview(review: PublicReview): DisplayReview {
  return {
    id: review.id,
    authorName: review.authorName,
    authorPhotoUrl: review.authorPhotoUrl,
    authorUrl: review.authorUrl,
    rating: review.rating,
    text: review.text,
    relativeTime: review.relativeTime,
    googleMapsUrl: review.googleMapsUrl,
    source: 'google',
  }
}

export default function TestimonialsSection({block}: {block: TestimonialsBlock}) {
  const prefersReducedMotion = useReducedMotion()
  const fallbackReviews = useMemo(() => manualReviews(block), [block])
  const [googleData, setGoogleData] = useState<GoogleReviewsPayload | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const source = stegaClean(block.source) === 'google' ? 'google' : 'manual'
  const autoplay = stegaClean(block.autoplay) !== false
  const intervalSeconds = Number(stegaClean(block.autoplayInterval)) || 7
  const requestStarted = useRef(false)

  useEffect(() => {
    if (source !== 'google' || requestStarted.current) return
    requestStarted.current = true

    const controller = new AbortController()
    fetch('/api/google-reviews', {signal: controller.signal, cache: 'no-store'})
      .then((response) => {
        if (!response.ok) throw new Error('Google Reviews request failed')
        return response.json() as Promise<GoogleReviewsPayload>
      })
      .then((payload) => {
        if (payload.reviews?.length) setGoogleData(payload)
      })
      .catch(() => {
        // The CMS testimonials intentionally remain visible as the fallback.
      })

    return () => controller.abort()
  }, [source])

  const reviews =
    source === 'google' && googleData?.reviews.length
      ? googleData.reviews.map(mapGoogleReview)
      : fallbackReviews
  const normalizedIndex = reviews.length ? activeIndex % reviews.length : 0
  const activeReview = reviews[normalizedIndex]

  useEffect(() => {
    if (!autoplay || paused || prefersReducedMotion || reviews.length < 2) return
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % reviews.length),
      intervalSeconds * 1000,
    )
    return () => window.clearInterval(timer)
  }, [autoplay, intervalSeconds, paused, prefersReducedMotion, reviews.length])

  if (!activeReview) return null

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length)
  const showNext = () => setActiveIndex((current) => (current + 1) % reviews.length)
  return (
    <section
      className="testimonials-section"
      aria-label={block.accessibleLabel || 'Client testimonials'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="testimonials-frame">
        {block.backgroundImage?.asset?._id ? (
          <SanityImage
            id={block.backgroundImage.asset._id}
            alt={block.backgroundImage.alt || ''}
            width={2000}
            crop={block.backgroundImage.crop}
            hotspot={block.backgroundImage.hotspot}
            mode="cover"
            className="testimonials-background"
          />
        ) : null}
        <div className="testimonials-shade" aria-hidden="true" />

        <div className="testimonials-content">
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Testimonial {normalizedIndex + 1} of {reviews.length}: {activeReview.text}
          </div>

          <div className="testimonials-slides">
            {reviews.map((review, index) => {
              const isActive = index === normalizedIndex
              const isGoogle = review.source === 'google'

              return (
                <article
                  key={review.id}
                  className={`testimonial-slide${isActive ? ' is-active' : ''}`}
                  aria-hidden={isActive ? undefined : true}
                >
                  <div
                    className="testimonials-stars"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({length: 5}, (_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={18}
                        aria-hidden="true"
                        fill={starIndex < review.rating ? 'currentColor' : 'transparent'}
                      />
                    ))}
                  </div>

                  <blockquote tabIndex={isActive ? 0 : -1}>“{review.text}”</blockquote>

                  <div className="testimonial-author">
                    {review.authorPhotoUrl ? (
                      // Google supplies this avatar together with the required author attribution.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={review.authorPhotoUrl} alt="" referrerPolicy="no-referrer" />
                    ) : review.photo?.asset?._id ? (
                      <SanityImage
                        id={review.photo.asset._id}
                        alt={review.photo.alt || ''}
                        width={128}
                        height={128}
                        crop={review.photo.crop}
                        hotspot={review.photo.hotspot}
                        mode="cover"
                      />
                    ) : (
                      <span className="testimonial-initials" aria-hidden="true">
                        {initials(review.authorName)}
                      </span>
                    )}

                    <div>
                      {review.authorUrl ? (
                        <a
                          href={review.authorUrl}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={isActive ? undefined : -1}
                        >
                          {review.authorName}
                        </a>
                      ) : (
                        <strong>{review.authorName}</strong>
                      )}
                      {(review.detail || review.relativeTime) && (
                        <p>{review.detail || review.relativeTime}</p>
                      )}
                    </div>
                  </div>

                  {isGoogle && review.googleMapsUrl ? (
                    <a
                      className="testimonial-source-link"
                      href={review.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={isActive ? undefined : -1}
                    >
                      View review on Google Maps <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : null}

                  {isGoogle ? (
                    <div className="testimonials-google-attribution">
                      <span>Google Maps</span>
                      <small>
                        {googleData?.orderingNotice ||
                          'Google Reviews are shown in relevance order.'}
                      </small>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>

          {reviews.length > 1 ? (
            <div className="testimonials-controls">
              <button type="button" onClick={showPrevious} aria-label="Previous testimonial">
                <ChevronLeft aria-hidden="true" />
              </button>
              <div className="testimonials-dots" role="group" aria-label="Choose testimonial">
                {reviews.map((review, index) => (
                  <button
                    type="button"
                    key={review.id}
                    className={index === normalizedIndex ? 'is-active' : ''}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show testimonial ${index + 1} of ${reviews.length}`}
                    aria-current={index === normalizedIndex ? 'true' : undefined}
                  />
                ))}
              </div>
              <button type="button" onClick={showNext} aria-label="Next testimonial">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          ) : null}

        </div>
      </div>
    </section>
  )
}
