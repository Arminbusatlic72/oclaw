import Link from 'next/link'

import {linkResolver} from '@/sanity/lib/utils'
import type {FooterLinkItem} from './types'

export default function FooterLinks({
  links,
  compact = false,
}: {
  links: FooterLinkItem[]
  compact?: boolean
}) {
  const resolvedLinks = links.flatMap((item) => {
    const href = linkResolver(item.link)
    return href && item.label ? [{...item, href}] : []
  })
  if (!resolvedLinks.length) return null

  return (
    <ul className={compact ? 'flex flex-wrap gap-x-4 gap-y-2' : 'space-y-2'}>
      {resolvedLinks.map((item) => (
        <li key={item._key}>
          <Link
            href={item.href}
            target={item.link.openInNewTab ? '_blank' : undefined}
            rel={item.link.openInNewTab ? 'noopener noreferrer' : undefined}
            className="text-sm text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
