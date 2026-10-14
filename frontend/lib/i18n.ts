export type Locale = 'en' | 'es'

export const SITE_ORIGIN = 'https://www.oclaw.us'

export const dictionary = {
  en: {
    home: 'Home',
    menu: 'Toggle navigation menu',
    language: 'Language',
    unavailable: 'Translation unavailable',
    footerHeading: 'Built with Sanity + Next.js',
    footerDescription: 'Use this project as a reusable, CMS-first starter for modern websites.',
  },
  es: {
    home: 'Inicio',
    menu: 'Abrir menú de navegación',
    language: 'Idioma',
    unavailable: 'Traducción no disponible',
    footerHeading: 'Creado con Sanity + Next.js',
    footerDescription: 'Un sitio web creado con contenido administrado en Sanity.',
  },
} as const

export function localePath(locale: Locale, slug?: string | null) {
  const segment = slug?.replace(/^\/+|\/+$/g, '')
  return `${locale === 'es' ? '/es' : ''}${segment ? `/${segment}` : ''}/`
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_ORIGIN).toString()
}

export function englishCanonicalPath(pathname: string) {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3)
  return null
}

export function settingsId(locale: Locale) {
  return locale === 'es' ? 'siteSettings-es' : 'siteSettings'
}

export function navigationId(locale: Locale) {
  return locale === 'es' ? 'siteNavigation-es' : 'siteNavigation'
}

export function footerId(locale: Locale) {
  return locale === 'es' ? 'siteFooter-es' : 'siteFooter'
}

export function safeLegacyUrl(value: string | null | undefined, locale: Locale) {
  if (!value) return null
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value
  if (!value.startsWith('/')) return null
  const parsed = new URL(value, SITE_ORIGIN)
  let path = parsed.pathname
  if (locale === 'es') {
    if (path === '/') path = '/es/'
    if (path === '/es') path = '/es/'
    if (!path.startsWith('/es/')) return null
  } else if (path === '/es' || path.startsWith('/es/')) {
    return null
  } else {
    path = englishCanonicalPath(path) || path
  }
  if (!path.endsWith('/') && !path.split('/').at(-1)?.includes('.')) path += '/'
  return `${path}${parsed.search}${parsed.hash}`
}

export type PageTarget = {_id: string; language?: string | null; slug?: string | null}

export function linkedTranslationPaths(
  locale: Locale,
  slug: string | null | undefined,
  entries:
    | Array<{
        language?: string | null
        page?: (PageTarget & {noIndex?: boolean | null}) | null
      }>
    | null
    | undefined,
  homeIds: Partial<Record<Locale, string | null>> = {},
  isHome = false,
) {
  const paths: Partial<Record<Locale, string>> = {
    [locale]: localePath(locale, isHome ? null : slug),
  }
  for (const entry of entries ?? []) {
    const language = entry.language
    const target = entry.page
    if (language !== 'en' && language !== 'es') continue
    if (!target?._id || target.noIndex || (!target.slug && !isHome)) continue
    if (target.language !== language && !(language === 'en' && !target.language)) continue
    if (isHome && homeIds[language] !== target._id.replace(/^drafts\./, '')) continue
    paths[language] = localePath(language, isHome ? null : target.slug)
  }
  return paths
}

export async function mapContentLinks<T>(
  input: T,
  locale: Locale,
  resolvePage: (target: PageTarget, locale: Locale) => Promise<string | null>,
): Promise<T> {
  if (Array.isArray(input)) {
    return (await Promise.all(input.map((item) => mapContentLinks(item, locale, resolvePage)))) as T
  }
  if (!input || typeof input !== 'object') return input

  const value = input as Record<string, unknown>
  const output: Record<string, unknown> = {...value}
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === 'object') {
      output[key] = await mapContentLinks(child, locale, resolvePage)
    }
  }
  if (value._type === 'link' || value.linkType === 'page') {
    if (value.linkType === 'page') {
      const target = value.page
      output.page =
        target && typeof target === 'object' && '_id' in target
          ? await resolvePage(target as PageTarget, locale)
          : null
    } else {
      output.href = safeLegacyUrl(value.href as string | null | undefined, locale)
    }
  }
  if ('url' in value && 'label' in value && 'link' in value) {
    const link = output.link as
      | {linkType?: string; page?: string | null; href?: string | null}
      | undefined
    const resolved = link?.linkType === 'page' ? link.page : link?.href
    output.url =
      typeof resolved === 'string'
        ? resolved
        : safeLegacyUrl(value.url as string | null | undefined, locale)
  }
  return output as T
}
