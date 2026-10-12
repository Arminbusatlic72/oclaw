'use client'

import {motion, useReducedMotion} from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'

type ScrollRevealProps = {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  className?: string
}

function getInitialOffset(direction: Direction, distance: number) {
  switch (direction) {
    case 'down':
      return {x: 0, y: -distance}
    case 'left':
      return {x: distance, y: 0}
    case 'right':
      return {x: -distance, y: 0}
    case 'up':
    default:
      return {x: 0, y: distance}
  }
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40,
  once = true,
  className,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const initialOffset = getInitialOffset(direction, distance)

  return (
    <motion.div
      className={className}
      initial={{opacity: 0, ...initialOffset}}
      whileInView={{opacity: 1, x: 0, y: 0}}
      viewport={{once, margin: '-80px'}}
      // This cubic-bezier eases quickly into place without feeling abrupt on scroll.
      transition={{duration, delay, ease: [0.25, 0.1, 0.25, 1]}}
    >
      {children}
    </motion.div>
  )
}
