import type {Locale} from './i18n'

export type Collection = 'practiceArea' | 'attorney' | 'office'
const paths: Record<Collection, Record<Locale, string>> = {
  practiceArea: {en: '/practice-areas/', es: '/es/areas-de-practica/'},
  attorney: {en: '/attorneys/', es: '/es/abogados/'},
  office: {en: '/offices/', es: '/es/oficinas/'},
}
export function collectionPath(type: Collection, locale: Locale, slug?: string | null) {
  return `${paths[type][locale]}${slug ? `${encodeURIComponent(slug)}/` : ''}`
}
