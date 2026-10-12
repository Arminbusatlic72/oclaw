'use client'

import {Children, isValidElement} from 'react'
import {motion, useReducedMotion, type Variants} from 'framer-motion'

type StaggeredGridProps = {
  children: React.ReactNode
  columns: 2 | 3 | 4
  className?: string
}

const columnClassMap: Record<StaggeredGridProps['columns'], string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

const containerVariants: Variants = {
  hidden: {opacity: 1},
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: {opacity: 0, y: 28},
  visible: {
    opacity: 1,
    y: 0,
    // A slightly longer ease-out keeps staggered cards from popping in too sharply.
    transition: {duration: 0.55, ease: smoothEase},
  },
}

export default function StaggeredGrid({children, columns, className}: StaggeredGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const gridClassName = `grid gap-6 ${columnClassMap[columns]}${className ? ` ${className}` : ''}`

  if (prefersReducedMotion) {
    return <div className={gridClassName}>{children}</div>
  }

  return (
    <motion.div
      className={gridClassName}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, margin: '-80px'}}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return child
        }

        return (
          <motion.div key={child.key ?? `stagger-item-${index}`} variants={itemVariants}>
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
