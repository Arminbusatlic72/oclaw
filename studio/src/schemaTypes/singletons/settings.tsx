import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Link, Settings} from '../../../sanity.types'

import * as demo from '../../lib/initialValues'
import {
  createLanguageField,
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
} from '../../i18n/config'

type SettingsDocumentLocaleSource = {
  _id?: unknown
  language?: unknown
}

/**
 * Localized settings use fixed IDs. The ID must win over the language field
 * because a newly opened singleton can be filtered before its hidden initial
 * language value has been applied.
 */
export function resolveSettingsLanguage(
  document: SettingsDocumentLocaleSource,
): SupportedLanguage {
  const documentId = typeof document._id === 'string' ? document._id : ''
  if (/(^|\.)siteSettings-es$/.test(documentId)) return 'es'
  if (/(^|\.)siteSettings$/.test(documentId)) return 'en'
  if (document.language === 'es') return 'es'
  return DEFAULT_LANGUAGE
}

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    createLanguageField(),
    defineField({
      name: 'title',
      description: 'This field is the global title for your website.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used on the Homepage',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
      of: [
        // Define a minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'href',
                    options: {
                      list: [
                        {title: 'URL', value: 'href'},
                        {title: 'Page', value: 'page'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'href' && !value) {
                          return 'URL is required when Link Type is URL'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'page',
                    title: 'Page',
                    type: 'reference',
                    to: [{type: 'page'}],
                    hidden: ({parent}) => parent?.linkType !== 'page',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'page' && !value) {
                          return 'Page reference is required when Link Type is Page'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'homePage',
      title: 'Homepage',
      description: 'Select the page rendered at the root URL for this language.',
      type: 'reference',
      to: [{type: 'page'}],
      options: {
        filter: ({document}) => ({
          filter: 'coalesce(language, $defaultLanguage) == $language',
          params: {
            language: resolveSettingsLanguage(document),
            defaultLanguage: DEFAULT_LANGUAGE,
          },
        }),
      },
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              const document = context.document as Settings
              if (document?.ogImage?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
          description: 'The absolute base URL used to resolve canonical and social metadata URLs.',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({language}) {
      return {
        title: 'Settings',
        subtitle: language ? String(language).toUpperCase() : 'Language not assigned',
      }
    },
  },
})
