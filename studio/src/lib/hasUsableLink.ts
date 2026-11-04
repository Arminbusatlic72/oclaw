/** A selected link object is a destination only after its required target is set. */
export function hasUsableLink(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const link = value as {
    linkType?: unknown
    href?: unknown
    page?: {_ref?: unknown} | null
    route?: unknown
    calendlyEventUrl?: unknown
    calendlyOfficeBookingOptions?: Array<{eventUrl?: unknown}> | null
  }
  if (link.linkType === 'href') return typeof link.href === 'string' && link.href.trim().length > 0
  if (link.linkType === 'page')
    return typeof link.page?._ref === 'string' && link.page._ref.length > 0
  if (link.linkType === 'route')
    return (
      link.route === 'attorneys' ||
      link.route === 'offices' ||
      link.route === 'resources' ||
      link.route === 'privacyPolicy'
    )
  if (link.linkType === 'calendly')
    return (
      (typeof link.calendlyEventUrl === 'string' && link.calendlyEventUrl.trim().length > 0) ||
      Boolean(
        link.calendlyOfficeBookingOptions?.some(
          (option) => typeof option.eventUrl === 'string' && option.eventUrl.trim().length > 0,
        ),
      )
    )
  return false
}
