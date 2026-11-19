'use client'

import {useEffect, useRef, useState} from 'react'
import {stegaClean} from '@sanity/client/stega'

export default function HighlightValue({value}: {value: string}) {
  const element = useRef<HTMLParagraphElement>(null)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const match = stegaClean(value).match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(.*)$/)
    const statistic = element.current

    if (!match || !statistic || !window.IntersectionObserver) return

    const [, integer, fraction = '', suffix] = match
    const target = Number(integer.replaceAll(',', '') + (fraction ? `.${fraction}` : ''))
    if (!Number.isFinite(target) || target === 0 || fraction.length > 20) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const format = new Intl.NumberFormat('en-US', {
      useGrouping: integer.includes(','),
      minimumFractionDigits: fraction.length,
      maximumFractionDigits: fraction.length,
    })
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (motion.matches) return

      const start = performance.now()
      setDisplayValue(format.format(0) + suffix)
      function tick(now: number) {
        const progress = Math.min((now - start) / 1100, 1)
        if (progress >= 1 || motion.matches) {
          setDisplayValue(value)
          return
        }
        setDisplayValue(format.format(target * (1 - (1 - progress) ** 3)) + suffix)
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    observer.observe(statistic)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <p ref={element} className="text-xl leading-tight text-[#819cb0] tabular-nums">
      <span className="sr-only">{stegaClean(value)}</span>
      <span aria-hidden="true">{displayValue}</span>
    </p>
  )
}
