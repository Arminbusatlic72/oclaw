import {localePath, type Locale} from './i18n.ts'

export const archivePath = (locale: Locale) => locale === 'es' ? '/es/blog-espanol/' : '/blog/'
export const archiveId = (locale: Locale) => `blogArchive-${locale}`
export const postPath = (locale: Locale, slug: string) => localePath(locale, slug)

export function resolveRouteCandidates(candidates: Array<{_id: string; _type: string}>, slug: string, locale: Locale) {
  const unique = new Map(candidates.map((candidate) => [candidate._id.replace(/^drafts\./, ''), candidate]))
  if (unique.size > 1) throw new Error(`URL collision at ${postPath(locale, slug)}: ${[...unique.values()].map((item) => `${item._type}:${item._id}`).join(', ')}`)
  return [...unique.values()][0] ?? null
}
