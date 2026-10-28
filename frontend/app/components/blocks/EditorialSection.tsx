import type {PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'

import PortableText from '@/app/components/PortableText'
import SanityImage from '@/app/components/SanityImage'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type EditorialSectionBlock = ExtractPageBuilderType<'editorialSection'>

export default function EditorialSection({block}: {block: EditorialSectionBlock}) {
  const isSplit = stegaClean(block.layout) === 'split' && Boolean(block.image?.asset?._id)
  const imageFirst = stegaClean(block.imagePosition) === 'left'
  const isSoft = stegaClean(block.theme) === 'soft'

  return (
    <section
      id={block.anchor?.current || undefined}
      className={`site-section editorial-section ${isSoft ? 'editorial-section-soft' : ''}`}
    >
      <div className={`container ${isSplit ? 'editorial-section-grid' : 'editorial-section-contained'}`}>
        <div className={`editorial-section-copy ${imageFirst ? 'editorial-section-copy-last' : ''}`}>
          {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
          <h2>{block.heading}</h2>
          <span className="about-accent" aria-hidden="true" />
          {block.body?.length ? (
            <PortableText
              value={block.body as PortableTextBlock[]}
              className="editorial-section-body prose-p:leading-[1.9]"
            />
          ) : null}
        </div>
        {isSplit && block.image?.asset?._id && (
          <figure className={`editorial-section-image ${imageFirst ? 'editorial-section-image-first' : ''}`}>
            <SanityImage
              id={block.image.asset._id}
              alt={block.image.alt || ''}
              width={1600}
              crop={block.image.crop}
              hotspot={block.image.hotspot}
              mode="cover"
              className="h-full w-full object-cover"
            />
          </figure>
        )}
      </div>
    </section>
  )
}
