'use client'

import {useEffect, useRef, useState} from 'react'
import {useReducedMotion} from 'framer-motion'

import {ExtractPageBuilderType} from '@/sanity/lib/types'

type StatisticsBlock = ExtractPageBuilderType<'statisticsSection'>
type Statistic = NonNullable<StatisticsBlock['items']>[number]

const animationDuration = 1600

function AnimatedNumber({item, start}: {item: Statistic; start: boolean}) {
  const target = Math.max(0, item.value ?? 0)
  const [displayValue, setDisplayValue] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!start) return

    if (prefersReducedMotion || target === 0) {
      setDisplayValue(target)
      return
    }

    let frameId = 0
    const startedAt = performance.now()

    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / animationDuration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(target * easedProgress))

      if (progress < 1) frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [prefersReducedMotion, start, target])

  const suffix = item.suffix || ''
  const finalValue = `${target.toLocaleString()}${suffix}`

  return (
    <>
      <span aria-hidden="true">
        {displayValue.toLocaleString()}
        {suffix}
      </span>
      <span className="sr-only">{finalValue}</span>
    </>
  )
}

export default function StatisticsSection({block}: {block: StatisticsBlock}) {
  const items = (block.items ?? []).filter(
    (item): item is Statistic => typeof item?.value === 'number' && Boolean(item.label),
  )
  const sectionRef = useRef<HTMLElement>(null)
  const [hasEnteredView, setHasEnteredView] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || hasEnteredView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setHasEnteredView(true)
        observer.disconnect()
      },
      {threshold: 0.25},
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [hasEnteredView])

  if (!items.length) return null

  return (
    <section
      ref={sectionRef}
      aria-label="Our results"
      className="overflow-hidden bg-[#1e3040] py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="container">
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
          {items.map((item, index) => (
            <li
              key={item._key ?? `${item.label}-${index}`}
              className="flex min-w-0 items-center justify-center gap-5 sm:justify-start lg:gap-7"
            >
              <p className="shrink-0 font-serif text-[clamp(4rem,7vw,7rem)] leading-[0.85] tracking-[-0.04em] tabular-nums">
                <AnimatedNumber item={item} start={hasEnteredView} />
              </p>
              <p className="max-w-[8rem] text-xl leading-snug sm:text-2xl lg:text-[1.65rem]">
                {item.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
