const CALENDLY_HOSTS = new Set(['calendly.com', 'www.calendly.com'])

export type CalendlyBookingOption = {id: string; label: string; url: string}

type CalendlyAction = {
  calendlyEventUrl?: unknown
  calendlyOfficeBookingOptions?: Array<{
    eventUrl?: unknown
    office?: {_id?: string | null; name?: string | null} | null
  }> | null
}

export function approvedCalendlyUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const url = new URL(value)
    const valid =
      url.protocol === 'https:' &&
      CALENDLY_HOSTS.has(url.hostname.toLowerCase()) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.split('/').filter(Boolean).length >= 2

    return valid ? url.toString() : null
  } catch {
    return null
  }
}

export function calendlyOptionsFromAction(
  action: CalendlyAction,
  locale: 'en' | 'es',
): CalendlyBookingOption[] {
  const globalUrl = approvedCalendlyUrl(action.calendlyEventUrl)
  const officeOptions = (action.calendlyOfficeBookingOptions || []).flatMap((option) => {
    const url = approvedCalendlyUrl(option.eventUrl)
    if (!url || !option.office?._id || !option.office.name) return []
    return [{id: option.office._id, label: option.office.name, url}]
  })

  return [
    ...(globalUrl
      ? [{id: 'global', label: locale === 'es' ? 'Todas las oficinas' : 'All offices', url: globalUrl}]
      : []),
    ...officeOptions,
  ]
}
