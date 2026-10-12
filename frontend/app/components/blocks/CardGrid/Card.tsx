import Image from 'next/image'

import {CardGridCard} from '@/sanity/lib/types'
import {urlForImage} from '@/sanity/lib/utils'

type CardProps = {
  card: CardGridCard
}

const imageSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

export default function Card({card}: CardProps) {
  const imageUrl = card.image
    ? urlForImage(card.image)?.width(900).height(700).fit('crop').auto('format').url()
    : undefined
  const ctaLabel = card.cta?.label
  const ctaUrl = typeof card.cta?.url === 'string' ? card.cta.url : undefined
  const hasCta = Boolean(ctaLabel && ctaUrl)
  const isExternalCta = Boolean(ctaUrl?.startsWith('http'))

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {imageUrl && (
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900/5">
          <Image
            src={imageUrl}
            alt={card.image?.alt || card.title}
            fill
            sizes={imageSizes}
            loading="lazy"
            quality={85}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 px-6 py-6">
        {card.tag && (
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">
            {card.tag}
          </span>
        )}
        <h3 className="text-2xl font-semibold leading-tight text-gray-900">{card.title}</h3>
        {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
        {hasCta && (
          <a
            href={ctaUrl}
            target={isExternalCta ? '_blank' : undefined}
            rel={isExternalCta ? 'noreferrer' : undefined}
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-brand transition hover:border-brand/50 hover:text-brand/70"
          >
            {ctaLabel}
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  )
}
