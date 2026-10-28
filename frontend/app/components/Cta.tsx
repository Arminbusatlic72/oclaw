import {PortableTextBlock} from 'next-sanity'

import ResolvedLink from '@/app/components/ResolvedLink'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import ScrollReveal from '@/components/animations/ScrollReveal'
import {Button} from '@/components/ui/button'
import {stegaClean} from '@sanity/client/stega'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type CtaProps = {
  block: ExtractPageBuilderType<'callToAction'>
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageType: string
  pageId: string
}

export default function CTA({block}: CtaProps) {
  const {heading, eyebrow, body = [], button, image, theme, contentAlignment} = block

  const isDark = theme === 'dark'
  const isImageFirst = stegaClean(contentAlignment) === 'imageFirst'
  const sectionThemeClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
  const bodyToneClass = isDark ? 'text-slate-300' : 'text-slate-600'

  return (
    <section className={`relative py-14 sm:py-20 ${sectionThemeClass}`}>
      <div className="container relative">
        <div className="grid gap-10 rounded-3xl border border-slate-200/60 bg-white/70 p-8 shadow-lg shadow-slate-900/5 backdrop-blur-sm sm:p-10 lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          <ScrollReveal
            direction={isImageFirst && image ? 'left' : 'right'}
            className={`${isImageFirst && image ? 'row-start-2 lg:row-start-1 lg:col-start-2' : ''} flex flex-col gap-4`}
          >
            <div>
              {eyebrow && (
                <span className="inline-flex w-fit rounded-full border border-slate-300 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  {eyebrow}
                </span>
              )}
              {heading && (
                <h2 className="site-block-heading mt-4">{heading}</h2>
              )}
              {body && (
                <div className={`${bodyToneClass} mt-4 lg:text-left`}>
                  <PortableText
                    value={body as PortableTextBlock[]}
                    className="dark:prose-invert prose-p:leading-relaxed"
                  />
                </div>
              )}
              {button?.buttonText && button?.link && (
                <div className="mt-6 flex">
                  <Button asChild size="lg" className="rounded-full px-6">
                    <ResolvedLink link={button?.link}>{button?.buttonText}</ResolvedLink>
                  </Button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {image?.asset?._ref && (
            <ScrollReveal
              direction={isImageFirst ? 'right' : 'left'}
              delay={0.08}
              className={`${isImageFirst ? 'lg:col-start-1' : ''} overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800`}
            >
              <Image
                id={image.asset._ref}
                alt="Section image"
                width={704}
                crop={image.crop}
                mode="cover"
                className="h-full w-full object-cover"
              />
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
