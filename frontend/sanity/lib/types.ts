import {GetPageQueryResult, SanityImageCrop, SanityImageHotspot} from '@/sanity.types'

export type HeroSliderSlide = {
  _key?: string
  _type?: 'heroSliderSlide'
  title?: string
  subtitle?: string
  description?: string
  image?: {
    _type: 'image'
    alt?: string
    crop?: SanityImageCrop
    hotspot?: SanityImageHotspot
    asset?: {
      _id: string
      metadata?: {
        dimensions?: {
          width?: number
          height?: number
        }
      }
    }
  }
  awardBadge?: {
    _type: 'image'
    alt?: string
    asset?: {
      _id: string
      metadata?: {dimensions?: {width?: number; height?: number}}
    }
    link?: DereferencedLink
  }
  multilingualInfo?: string
  services?: string[]
  cta?: {
    label?: string
    url?: string
    link?: DereferencedLink
  }
  secondaryCta?: {
    label?: string
    url?: string
    link?: DereferencedLink
  }
}

export type HeroSliderSection = {
  _type: 'heroSlider'
  _key?: string
  slides?: HeroSliderSlide[]
  layout?: 'classic' | 'immigration'
  enhancedClassic?: boolean
  showAwardBadge?: boolean
  showPracticeAreas?: boolean
  practiceAreasHeading?: string
  practiceAreasSelectionMode?: 'manual' | 'automatic'
  practiceAreas?: Array<{_ref?: string}>
  maximumPracticeAreas?: number
  autoplay?: boolean
  autoplayInterval?: number
  showDots?: boolean
  showArrows?: boolean
}

export type HeroPracticeArea = {
  _id: string
  title: string
  href: string
}

export type CardGridSection = ExtractPageBuilderType<'cardGrid'>
export type CardGridCard = NonNullable<CardGridSection['cards']>[number]

export type PageBuilderSection = NonNullable<NonNullable<GetPageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Represents a link after GROQ dereferencing.
export type DereferencedLink = {
  _type: 'link'
  linkType?: 'href' | 'page' | 'route'
  href?: string
  route?: 'attorneys' | 'offices'
  page?:
    | string
    | {
        _id: string
        _type?: 'page' | 'practiceAreaArchive' | 'blogArchive' | string
        language?: string | null
        slug?: string | null
      }
    | null
  openInNewTab?: boolean
}
