import {
  Facebook,
  Globe2,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react'

import type {FooterSocialBlock} from './types'

const platformIcons: Record<FooterSocialBlock['links'][number]['platform'], LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  x: Twitter,
  tiktok: Music2,
  other: Globe2,
}

const fallbackIcons: Record<string, LucideIcon> = {
  globe: Globe2,
  link: Link2,
  message: MessageCircle,
}

function getSocialIcon(
  platform: FooterSocialBlock['links'][number]['platform'],
  iconIdentifier?: string,
): LucideIcon {
  const normalizedPlatform = platform?.trim().toLowerCase()

  if (normalizedPlatform === 'other') {
    return fallbackIcons[iconIdentifier?.trim().toLowerCase() || 'globe'] ?? Globe2
  }

  return platformIcons[normalizedPlatform as keyof typeof platformIcons] ?? Globe2
}

export default function FooterSocial({block}: {block: FooterSocialBlock}) {
  if (!block.links?.length) return null

  return (
    <section>
      {block.heading && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          {block.heading}
        </h2>
      )}
      <ul className={`flex flex-wrap gap-2 ${block.heading ? 'mt-4' : ''}`}>
        {block.links.map((item) => {
          const Icon = getSocialIcon(item.platform, item.iconIdentifier)

          return (
            <li key={item._key}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-500 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
