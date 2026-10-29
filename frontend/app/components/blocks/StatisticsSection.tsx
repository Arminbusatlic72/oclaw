'use client'

import {useEffect, useRef, useState} from 'react'
import {Building2, BriefcaseBusiness, MapPin, Scale, Trophy, UsersRound} from 'lucide-react'
import {useReducedMotion} from 'framer-motion'
import {stegaClean} from '@sanity/client/stega'

import {ExtractPageBuilderType} from '@/sanity/lib/types'

type StatisticsBlock = ExtractPageBuilderType<'statisticsSection'>
type Statistic = NonNullable<StatisticsBlock['items']>[number]

const animationDuration = 1600

const statisticIcons = {
  briefcase: BriefcaseBusiness,
  people: UsersRound,
  building: Building2,
  scales: Scale,
  trophy: Trophy,
  location: MapPin,
}

function AnimatedNumber({item, start}: {item: Statistic; start: boolean}) {
  const target = Math.max(0, item.value ?? 0)
  const [displayValue, setDisplayValue] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!start) return

    if (prefersReducedMotion || target === 0) return

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
  const visibleValue = start && prefersReducedMotion ? target : displayValue

  return (
    <>
      <span aria-hidden="true">
        {visibleValue.toLocaleString()}
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

  const gridColumns =
    items.length === 1
      ? 'grid-cols-1'
      : items.length === 2
        ? 'sm:grid-cols-2'
        : items.length === 3
          ? 'sm:grid-cols-3'
          : 'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <section
      ref={sectionRef}
      aria-label="Our results"
      className="overflow-hidden bg-[#1e3040] py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="container">
        <ul className={`grid gap-x-10 gap-y-12 lg:gap-x-14 ${gridColumns}`}>
          {items.map((item, index) => (
            <StatisticItem
              key={item._key ?? `${item.label}-${index}`}
              item={item}
              start={hasEnteredView}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

function StatisticItem({item, start}: {item: Statistic; start: boolean}) {
  const iconName = stegaClean(item.icon || 'none') as keyof typeof statisticIcons | 'none'
  const Icon = iconName === 'none' ? null : statisticIcons[iconName]

  return (
    <li className="flex min-w-0 flex-col items-center justify-center text-center">
      {Icon && (
        <span className="mb-5 grid size-12 place-items-center rounded-full border border-[#cdb091]/55 text-[#cdb091] sm:size-14">
          <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
        </span>
      )}
      <p className="font-serif text-[clamp(3.25rem,5vw,5rem)] leading-[0.9] tracking-[-0.035em] tabular-nums">
        <AnimatedNumber item={item} start={start} />
      </p>
      <p className="mt-3 text-lg leading-snug sm:text-xl">{item.label}</p>
    </li>
  )
}
