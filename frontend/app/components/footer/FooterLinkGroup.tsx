import FooterLinks from './FooterLinks'
import type {FooterLinkGroupBlock} from './types'

export default function FooterLinkGroup({block}: {block: FooterLinkGroupBlock}) {
  if (!block.links?.length) return null

  return (
    <nav aria-label={block.heading}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
        {block.heading}
      </h2>
      <div className="mt-4">
        <FooterLinks links={block.links} />
      </div>
    </nav>
  )
}
