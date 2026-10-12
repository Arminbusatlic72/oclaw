'use client'

import {useRef} from 'react'
import Image, {type ImageProps} from 'next/image'
import Link from 'next/link'
import {motion, useReducedMotion} from 'framer-motion'

import ScrollReveal from '@/components/animations/ScrollReveal'
import useParallax from '@/hooks/useParallax'
import {Button} from '@/components/ui/button'

type ParallaxHeroProps = {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  backgroundImage: ImageProps['src']
}

export default function ParallaxHero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  backgroundImage,
}: ParallaxHeroProps) {
  const backgroundRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useParallax(backgroundRef, 0.18)

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-slate-950 text-white">
      <div ref={backgroundRef} className="absolute inset-0 will-change-transform">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/40 via-slate-950/70 to-slate-950/95" />

      <div className="container relative z-10 py-24">
        <div className="max-w-4xl">
          <ScrollReveal direction="up" distance={56} duration={0.8} className="max-w-fit">
            <span className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
              Motion-Ready Starter
            </span>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.08} distance={56} duration={0.85} className="mt-6">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.16} distance={48} duration={0.8} className="mt-6">
            <p className="max-w-2xl text-lg text-white/75 sm:text-xl">{subtitle}</p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.24} distance={32} duration={0.7} className="mt-8">
            <motion.div
              whileHover={prefersReducedMotion ? undefined : {scale: 1.03}}
              whileTap={prefersReducedMotion ? undefined : {scale: 0.98}}
              // A short spring keeps the CTA tactile without introducing lag.
              transition={{type: 'spring', stiffness: 260, damping: 18}}
              className="w-fit"
            >
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}