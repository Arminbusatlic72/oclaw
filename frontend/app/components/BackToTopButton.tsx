'use client'

import {useEffect, useState} from 'react'
import {ArrowUp} from 'lucide-react'

export default function BackToTopButton({locale}: {locale: 'en' | 'es'}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let frame = 0

    const updateVisibility = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => setIsVisible(window.scrollY > 600))
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, {passive: true})

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'})
  }

  const label = locale === 'es' ? 'Volver arriba' : 'Back to top'

  return (
    <button
      type="button"
      className="back-to-top"
      data-visible={isVisible}
      onClick={scrollToTop}
      aria-label={label}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <ArrowUp aria-hidden="true" />
    </button>
  )
}
