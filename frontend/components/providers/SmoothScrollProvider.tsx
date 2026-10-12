'use client'

import {useEffect} from 'react'
import Lenis from 'lenis'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type SmoothScrollProviderProps = {
  children: React.ReactNode
}

export default function SmoothScrollProvider({children}: SmoothScrollProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
    })

    const syncScrollTrigger = () => ScrollTrigger.update()
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', syncScrollTrigger)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
