const CALENDLY_HOSTS = new Set(['calendly.com', 'www.calendly.com'])

export function isApprovedCalendlyUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false

  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      CALENDLY_HOSTS.has(url.hostname.toLowerCase()) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.split('/').filter(Boolean).length >= 2
    )
  } catch {
    return false
  }
}

export const calendlyUrlValidationMessage =
  'Use a full HTTPS Calendly event URL (calendly.com or www.calendly.com) without query parameters or fragments.'
