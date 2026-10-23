import {defineField} from 'sanity'

export const DEFAULT_LANGUAGE = 'en'

export const supportedLanguages = [
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Spanish'},
] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]['id']

export const translatedSchemaTypes = ['page', 'blogPost', 'navigation', 'settings', 'footer', 'practiceArea', 'attorney', 'office']

export const localizedSingletons = [
  {
    schemaType: 'practiceAreaArchive', title: 'Practice areas archive',
    documents: {en: 'practiceAreaArchive-en', es: 'practiceAreaArchive-es'},
  },
  {
    schemaType: 'blogArchive', title: 'Blog archive',
    documents: {en: 'blogArchive-en', es: 'blogArchive-es'},
  },
  {
    schemaType: 'navigation',
    title: 'Navigation',
    documents: {
      en: 'siteNavigation',
      es: 'siteNavigation-es',
    },
  },
  {
    schemaType: 'settings',
    title: 'Site Settings',
    documents: {
      en: 'siteSettings',
      es: 'siteSettings-es',
    },
  },
  {
    schemaType: 'footer',
    title: 'Footer',
    documents: {
      en: 'siteFooter',
      es: 'siteFooter-es',
    },
  },
] as const

/**
 * The document internationalization plugin owns this field. It is hidden and
 * read-only so editors change languages through the plugin UI instead of
 * altering the relationship manually.
 *
 * It intentionally is not required during Phase 2A so existing documents stay
 * valid until the controlled English-language migration in Phase 2B.
 */
export function createLanguageField() {
  return defineField({
    name: 'language',
    title: 'Language',
    type: 'string',
    initialValue: DEFAULT_LANGUAGE,
    readOnly: true,
    hidden: true,
    options: {
      list: supportedLanguages.map(({id, title}) => ({title, value: id})),
    },
  })
}
