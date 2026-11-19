import type {PortableTextBlock} from 'next-sanity'
import {Award, BriefcaseBusiness, House, Scale, ShieldCheck, Star, UsersRound} from 'lucide-react'

import PortableText from '@/app/components/PortableText'
import ResolvedLink from '@/app/components/ResolvedLink'
import Image from '@/app/components/SanityImage'
import HighlightValue from './HighlightValue'
import {ExtractPageBuilderType} from '@/sanity/lib/types'
import {linkResolver} from '@/sanity/lib/utils'
import {stegaClean} from '@sanity/client/stega'
import type {Locale} from '@/lib/i18n'

type WhyChooseUsBlock = ExtractPageBuilderType<'whyChooseUs'>
type Highlight = NonNullable<WhyChooseUsBlock['highlights']>[number]

const highlightIcons = {
  award: Award,
  briefcase: BriefcaseBusiness,
  scale: Scale,
  shield: ShieldCheck,
  people: UsersRound,
  star: Star,
  house: House,
}

const sectionPadding = {
  standard: 'py-12 sm:py-16 lg:py-20',
  compact: 'py-10 sm:py-12 lg:py-14',
}

export default function WhyChooseUs({block, locale = 'en'}: {block: WhyChooseUsBlock; locale?: Locale}) {
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
    procedureEyebrow,
    procedureHeading,
    procedureIntro,
    procedureSteps,
    ctaLabel,
    ctaLink,
  } = block
  const isLight = stegaClean(backgroundTheme) === 'light'
  const themeClass = isLight ? 'bg-[#f7f4ef] text-[#1e3040]' : 'bg-[#1e3040] text-[#f8f8f8]'
  const mutedClass = isLight ? 'text-[#536575]' : 'text-[#c5d0d8]'
  const separatorClass = isLight ? 'border-[#cdb091]' : 'border-[#819cb0]/40'
  const stepNumberClass = isLight
    ? 'border-[#cdb091] bg-[#efe7dd] text-[#74512d]'
    : 'border-[#c5a47b]/45 bg-[#263b4d] text-[#e0bf96]'
  const spacingClass = sectionPadding[stegaClean(variant) === 'compact' ? 'compact' : 'standard']
  const hasCta = Boolean(ctaLabel && ctaLink && (ctaLink.linkType === 'calendly' || linkResolver(ctaLink)))
  const imageAssetId = image?.asset?._id
  const steps = procedureSteps ?? []
  const hasProcedure = Boolean(procedureEyebrow || procedureHeading || procedureIntro || steps.length)

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

          <div className="min-w-0 self-center">
            {specializationHeading && (
              <h3 className="font-serif text-2xl leading-tight sm:text-3xl">
                {specializationHeading}
              </h3>
            )}
            {highlights && highlights.length > 0 && (
              <ul className={specializationHeading ? 'mt-12' : undefined}>
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
            {hasProcedure ? (
              <div>
                {(procedureEyebrow || procedureHeading || procedureIntro) && (
                  <header className="mb-7">
                    {procedureEyebrow && (
                      <p className="site-block-eyebrow flex items-center gap-3">
                        <span aria-hidden="true" className="h-px w-6 shrink-0 bg-current" />
                        {procedureEyebrow}
                      </p>
                    )}
                    {procedureHeading && (
                      <h3 className="mt-2 text-balance font-serif text-3xl leading-tight sm:text-4xl">
                        {procedureHeading}
                      </h3>
                    )}
                    {procedureIntro && (
                      <p className={`mt-3 max-w-prose text-sm leading-relaxed ${mutedClass}`}>{procedureIntro}</p>
                    )}
                  </header>
                )}
                {steps.length > 0 && (
                  <ol role="list">
                    {steps.map((step, index) => (
                      <li
                        key={step._key}
                        className={`relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 pb-5 last:pb-0 before:absolute before:top-10 before:bottom-0 before:left-5 before:border-l last:before:hidden ${separatorClass} before:border-inherit`}
                      >
                        <span aria-hidden="true" className={`grid aspect-square place-items-center rounded-full border font-serif text-base tabular-nums ${stepNumberClass}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="pt-1.5">
                          <h4 className="font-serif text-xl leading-tight">{step.title}</h4>
                          {step.description && (
                            <p className={`mt-1 text-sm leading-relaxed ${mutedClass}`}>{step.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
            {hasCta && ctaLink && ctaLabel && (
              <div className={steps.length > 0 ? 'mt-10' : 'mt-7'}>
                <ResolvedLink link={ctaLink} locale={locale} className="site-button-outline site-hero-cta">
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
        <HighlightValue key={highlight.value} value={highlight.value} />
        <h4 className="mt-2 font-serif text-xl font-semibold leading-tight sm:text-2xl">{highlight.label}</h4>
        {highlight.description && (
          <p className={`mt-1 text-sm leading-6 ${mutedClass}`}>{highlight.description}</p>
        )}
      </div>
    </li>
  )
}
