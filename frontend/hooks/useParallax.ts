'use client'

import {useEffect, type RefObject} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function useParallax(ref: RefObject<HTMLElement | null>, speed: number): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const element = ref.current
    if (!element) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    gsap.set(element, {willChange: 'transform'})
    const setY = gsap.quickSetter(element, 'y', 'px')

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const distance = window.innerHeight * speed
        const offset = (self.progress - 0.5) * distance * 2
        setY(-offset)
      },
    })

    return () => {
      trigger.kill()
      gsap.set(element, {clearProps: 'transform,willChange'})
    }
  }, [ref, speed])
}