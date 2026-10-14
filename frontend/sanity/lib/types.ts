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
  cta?: {
    label?: string
    url?: string
  }
}

export type HeroSliderSection = {
  _type: 'heroSlider'
  _key?: string
  slides?: HeroSliderSlide[]
  autoplay?: boolean
  autoplayInterval?: number
  showDots?: boolean
  showArrows?: boolean
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
  linkType?: 'href' | 'page'
  href?: string
  page?: string | {_id: string; language?: string | null; slug?: string | null} | null
  openInNewTab?: boolean
}
