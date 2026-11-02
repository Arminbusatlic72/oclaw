import type {PortableTextBlock} from 'next-sanity'
import {Award, BriefcaseBusiness, Scale, ShieldCheck, Star, UsersRound} from 'lucide-react'

import PortableText from '@/app/components/PortableText'
import ResolvedLink from '@/app/components/ResolvedLink'
import Image from '@/app/components/SanityImage'
import {ExtractPageBuilderType} from '@/sanity/lib/types'
import {linkResolver} from '@/sanity/lib/utils'
import {stegaClean} from '@sanity/client/stega'

type WhyChooseUsBlock = ExtractPageBuilderType<'whyChooseUs'>
type Highlight = NonNullable<WhyChooseUsBlock['highlights']>[number]

const highlightIcons = {
  award: Award,
  briefcase: BriefcaseBusiness,
  scale: Scale,
  shield: ShieldCheck,
  people: UsersRound,
  star: Star,
}

const sectionPadding = {
  standard: 'py-10 sm:py-12 lg:py-9',
  compact: 'py-8 sm:py-10 lg:py-8',
}

export default function WhyChooseUs({block}: {block: WhyChooseUsBlock}) {
  const {
    subtitle,
    heading,
    description,
    anchorId,
    backgroundTheme = 'navy',
    variant = 'standard',
    image,
    specializationHeading,
    highlights,
    contentHeading,
    body,
    ctaLabel,
    ctaLink,
  } = block
  const isLight = stegaClean(backgroundTheme) === 'light'
  const themeClass = isLight ? 'bg-[#f7f4ef] text-[#1e3040]' : 'bg-[#1e3040] text-[#f8f8f8]'
  const mutedClass = isLight ? 'text-[#536575]' : 'text-[#c5d0d8]'
  const separatorClass = isLight ? 'border-[#cdb091]' : 'border-[#819cb0]/40'
  const spacingClass = sectionPadding[stegaClean(variant) === 'compact' ? 'compact' : 'standard']
  const hasCta = Boolean(ctaLabel && ctaLink && linkResolver(ctaLink))
  const imageAssetId = image?.asset?._id

  return (
    <section
      id={anchorId || undefined}
      aria-labelledby={anchorId ? `${anchorId}-heading` : undefined}
      className={`why-choose-us-section ${spacingClass} ${themeClass}`}
    >
      <div className="container">
        {heading && (
          <header className="practice-section-header">
            {subtitle && <p className="practice-eyebrow site-block-eyebrow">{subtitle}</p>}
            <h2
              id={anchorId ? `${anchorId}-heading` : undefined}
              className="site-block-heading"
            >
              {heading}
            </h2>
            <span className="practice-divider" aria-hidden="true" />
            {description && <p className="site-block-subheading">{description}</p>}
          </header>
        )}

        <div className="grid gap-9 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-12">
          <figure className="min-w-0">
            {imageAssetId && (
              <div className="overflow-hidden border border-[#c5a47b]/70 p-5">
                <div className="relative aspect-[4/5] overflow-hidden bg-black/10">
                  <Image
                    id={imageAssetId}
                    alt={image?.alt ? stegaClean(image.alt) : ''}
                    width={760}
                    crop={image?.crop}
                    hotspot={image?.hotspot}
                    mode="cover"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            {image?.caption && (
              <figcaption className={`mt-3 text-sm ${mutedClass}`}>
                {image.caption}
              </figcaption>
            )}
          </figure>

          <div className="min-w-0">
            {specializationHeading && (
              <h3 className="font-serif text-2xl leading-tight sm:text-3xl">
                {specializationHeading}
              </h3>
            )}
            {highlights && highlights.length > 0 && (
              <ul className="mt-12">
                {highlights.map((highlight: Highlight) => (
                  <HighlightItem
                    key={highlight._key}
                    highlight={highlight}
                    mutedClass={mutedClass}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className={`min-w-0 border-t pt-8 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-12 ${separatorClass}`}>
            {contentHeading && (
              <h3 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]">
                {contentHeading}
              </h3>
            )}
            {body && body.length > 0 && (
              <div className="why-choose-us-body mt-5" data-theme={isLight ? 'light' : 'dark'}>
                <PortableText
                  value={body as PortableTextBlock[]}
                  plainCode
                  className="prose-p:my-0 prose-p:leading-8 [&>div>p+p]:mt-5"
                />
              </div>
            )}
            {hasCta && ctaLink && ctaLabel && (
              <div className="mt-7">
                <ResolvedLink link={ctaLink} className="site-button-outline site-hero-cta">
                  {ctaLabel}
                </ResolvedLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function HighlightItem({
  highlight,
  mutedClass,
}: {
  highlight: Highlight
  mutedClass: string
}) {
  const iconName = stegaClean(highlight.icon || 'award') as keyof typeof highlightIcons
  const Icon = highlightIcons[iconName] || Award

  return (
    <li className="flex gap-4 py-8 first:pt-0 last:pb-0">
      <span className="flex w-12 shrink-0 items-center justify-center self-stretch border-r border-[#819cb0]/50 pr-4 text-[#c5a47b]">
        <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
      </span>
      <div className="min-w-0">
        <p className="text-xl leading-tight text-[#819cb0]">{highlight.value}</p>
        <h4 className="mt-2 font-serif text-xl font-semibold leading-tight sm:text-2xl">{highlight.label}</h4>
        {highlight.description && (
          <p className={`mt-1 text-sm leading-6 ${mutedClass}`}>{highlight.description}</p>
        )}
      </div>
    </li>
  )
}
