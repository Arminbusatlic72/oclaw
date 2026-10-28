/** A selected link object is a destination only after its required target is set. */
export function hasUsableLink(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const link = value as {linkType?: unknown; href?: unknown; page?: {_ref?: unknown} | null; route?: unknown}
  if (link.linkType === 'href') return typeof link.href === 'string' && link.href.trim().length > 0
  if (link.linkType === 'page') return typeof link.page?._ref === 'string' && link.page._ref.length > 0
  if (link.linkType === 'route') return link.route === 'attorneys' || link.route === 'offices'
  return false
}
