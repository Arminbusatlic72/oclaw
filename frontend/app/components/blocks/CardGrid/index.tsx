import {CardGridCard, ExtractPageBuilderType} from '@/sanity/lib/types'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggeredGrid from '@/components/animations/StaggeredGrid'

import Card from './Card'

type CardGridBlock = ExtractPageBuilderType<'cardGrid'>

type CardGridProps = {
  block: CardGridBlock
}

const columnMap = (columns?: number) => Math.min(Math.max(columns ?? 3, 2), 4)
const gridColumnClasses: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

const toIdFragment = (value?: string) => {
  const base = value?.trim() ? value : 'card-grid'
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CardGrid({block}: CardGridProps) {
  const {heading, subheading, cards, columns, alignment} = block
  const normalizedCards = (cards ?? []).filter((card): card is CardGridCard => Boolean(card))
  if (!normalizedCards.length) {
    return null
  }

  const sanitizedHeading = toIdFragment(heading ?? undefined)
  const headingId = `card-grid-heading-${sanitizedHeading}`
  const columnCount = columnMap(columns ?? undefined)
  const alignCenter = alignment === 'center'
  const textAlignment = alignCenter ? 'items-center text-center' : 'items-start text-left'
  const gridColumnsClass = gridColumnClasses[columnCount]

  const cardElements = normalizedCards.map((card, index) => (
    <Card key={card._key ?? `${card.title ?? 'card'}-${index}`} card={card} />
  ))

  return (
    <section aria-labelledby={headingId} className="container mx-auto py-12">
      {heading || subheading ? (
        <ScrollReveal direction="up" className={`mb-10 flex flex-col gap-3 ${textAlignment}`}>
          {heading && (
            <h2 id={headingId} className="site-block-heading text-gray-900">
              {heading}
            </h2>
          )}
          {subheading && <p className="site-block-subheading max-w-3xl text-gray-600">{subheading}</p>}
        </ScrollReveal>
      ) : (
        <h2 id={headingId} className="sr-only">
          Card grid
        </h2>
      )}
      <StaggeredGrid columns={columnCount as 2 | 3 | 4} className={gridColumnsClass}>
        {cardElements}
      </StaggeredGrid>
    </section>
  )
}
