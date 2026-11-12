import Image from 'next/image'
import Link from 'next/link'

import {localePath, type Locale} from '@/lib/i18n'
import {urlForImage} from '@/sanity/lib/utils'
import type {FooterBrandBlock} from './types'

export default function FooterBrand({block, locale}: {block: FooterBrandBlock; locale: Locale}) {
  const imageUrl = block.logo
    ? urlForImage(block.logo)?.width(951).fit('max').auto('format').url()
    : null
  if (!imageUrl && !block.supportingText) return null

  const image = imageUrl ? (
    <Image
      src={imageUrl}
      alt={block.logo?.alt || ''}
      width={475.2}
      height={158.4}
      className="h-auto max-h-[126.72px] w-auto max-w-full object-contain object-left"
    />
  ) : null

  return (
    <section>
      {image && block.linkToHomepage && block.logo?.alt ? (
        <Link href={localePath(locale)} className="inline-flex" aria-label={block.logo.alt}>
          {image}
        </Link>
      ) : (
        image
      )}
      {block.supportingText && (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
          {block.supportingText}
        </p>
      )}
    </section>
  )
}
