import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import ScrollReveal from '@/components/animations/ScrollReveal'
import {InfoSection} from '@/sanity.types'

type InfoProps = {
  block: InfoSection
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageId: string
  pageType: string
}

export default function CTA({block}: InfoProps) {
  return (
    <section className="container my-12 sm:my-16">
      <ScrollReveal direction="up">
        <div className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        {block?.heading && (
          <h2 className="text-3xl leading-tight text-slate-900 md:text-4xl dark:text-slate-100">
            {block.heading}
          </h2>
        )}
        {block?.subheading && (
          <span className="mt-4 mb-8 block text-sm uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
            {block.subheading}
          </span>
        )}
        <div className="mt-4 text-slate-700 dark:text-slate-200">
          {block?.content?.length && (
            <PortableText
              className="prose-p:leading-relaxed"
              value={block.content as PortableTextBlock[]}
            />
          )}
        </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
