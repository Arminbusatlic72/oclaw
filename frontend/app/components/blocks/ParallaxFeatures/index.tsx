'use client'

import {useRef} from 'react'
import Image from 'next/image'
import {stegaClean} from '@sanity/client/stega'

import ScrollReveal from '@/components/animations/ScrollReveal'
import useParallax from '@/hooks/useParallax'
import {ExtractPageBuilderType} from '@/sanity/lib/types'
import {urlForImage} from '@/sanity/lib/utils'

type ParallaxFeaturesBlock = ExtractPageBuilderType<'parallaxFeatures'>
type ParallaxFeature = NonNullable<ParallaxFeaturesBlock['features']>[number]

type ParallaxFeaturesProps = {
  block: ParallaxFeaturesBlock
}

const columnMap = (columns?: number) => Math.min(Math.max(columns ?? 2, 1), 3)
const gridColumnClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
}

const toIdFragment = (value?: string) => {
  const base = value?.trim() ? value : 'parallax-features'

  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ParallaxFeatures({block}: ParallaxFeaturesProps) {
  const {heading, subheading, features, columns, theme = 'light'} = block
  const normalizedFeatures = (features ?? []).filter((f): f is ParallaxFeature => Boolean(f?.title))

  if (!normalizedFeatures.length) {
    return null
  }

  const sectionId = `parallax-features-${toIdFragment(heading ?? undefined)}`
  const isDark = theme === 'dark'
  const sectionClass = isDark
    ? 'bg-slate-950 text-slate-100'
    : 'bg-white text-slate-950'
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const mutedClass = isDark ? 'text-slate-300' : 'text-slate-600'
  const columnCount = columnMap(columns ?? undefined)
  const gridColumnsClass = gridColumnClasses[columnCount]

  return (
    <section aria-labelledby={sectionId} className={`py-16 sm:py-24 ${sectionClass}`}>
      <div className="container">
        <ScrollReveal direction="up" className="mx-auto max-w-2xl text-center">
          {heading && (
            <h2 id={sectionId} className={`text-3xl font-semibold md:text-4xl lg:text-5xl ${headingClass}`}>
              {heading}
            </h2>
          )}
          {subheading && <p className={`mt-4 text-base leading-7 ${mutedClass}`}>{subheading}</p>}
        </ScrollReveal>

        <div className={`mt-14 grid gap-8 sm:gap-10 ${gridColumnsClass}`}>
          {normalizedFeatures.map((feature, index) => (
            <ParallaxCard key={feature._key ?? `${feature.title}-${index}`} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ParallaxCard({feature}: {feature: ParallaxFeature}) {
  const imageRef = useRef<HTMLDivElement>(null)

  // Use parallax only if we have an image (hook handles null refs gracefully)
  useParallax(imageRef, 0.12)

  const imageUrl = feature.image?.asset?.url || (feature.image ? urlForImage(feature.image).url() : null)

  return (
    <ScrollReveal direction="up" className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {/* Image with parallax */}
      {imageUrl && (
        <div
          ref={imageRef}
          className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
          style={{willChange: 'transform'}}
        >
          <Image
            src={imageUrl}
            alt={stegaClean(feature.image?.alt || 'Feature image')}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {feature.title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>}

        {feature.description && (
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
        )}

        {feature.cta?.label && feature.cta.url && (
          <a
            href={feature.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:text-blue-800 dark:border-blue-500/40 dark:text-blue-300 dark:hover:border-blue-400 dark:hover:text-blue-200"
          >
            {feature.cta.label} →
          </a>
        )}
      </div>
    </ScrollReveal>
  )
}
