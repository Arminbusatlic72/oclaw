import React from 'react'

import HeroSlider from '@/app/components/blocks/HeroSlider'
import CardGrid from '@/app/components/blocks/CardGrid'
import ProcessSteps from '@/app/components/blocks/ProcessSteps'
import ParallaxFeatures from '@/app/components/blocks/ParallaxFeatures'
import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import WhyChooseUs from '@/app/components/blocks/WhyChooseUs'
import PracticeAreasSection from '@/app/components/blocks/PracticeAreasSection'
import AttorneysSection from '@/app/components/blocks/AttorneysSection'
import PageHero from '@/app/components/blocks/PageHero'
import EditorialSection from '@/app/components/blocks/EditorialSection'
import CtaBanner from '@/app/components/blocks/CtaBanner'
import type {Locale} from '@/lib/i18n'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'

type BlockProps = {
  index: number
  block: PageBuilderSection
  pageId: string
  pageType: string
  locale?: Locale
}

type BlocksType = {
  [key: string]: React.FC<BlockProps>
}

const Blocks = {
  heroSlider: HeroSlider,
  cardGrid: CardGrid,
  processSteps: ProcessSteps,
  parallaxFeatures: ParallaxFeatures,
  callToAction: Cta,
  infoSection: Info,
  whyChooseUs: WhyChooseUs,
  pageHero: PageHero,
  editorialSection: EditorialSection,
  ctaBanner: CtaBanner,
} as BlocksType

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType, locale = 'en'}: BlockProps) {
  if (block._type === 'practiceAreasSection') return <div data-sanity={dataAttr({id: pageId, type: pageType, path: `pageBuilder[_key=="${block._key}"]`}).toString()}><PracticeAreasSection block={block} locale={locale} /></div>
  if (block._type === 'attorneysSection') return <div data-sanity={dataAttr({id: pageId, type: pageType, path: `pageBuilder[_key=="${block._key}"]`}).toString()}><AttorneysSection block={block} locale={locale} /></div>
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          block: block,
          index: index,
          pageId: pageId,
          pageType: pageType,
          locale: locale,
        })}
      </div>
    )
  }
  // Block doesn't exist yet
  return React.createElement(
    () => (
      <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
      </div>
    ),
    {key: block._key},
  )
}
