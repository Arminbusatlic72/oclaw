import {defineArrayMember, defineField, defineType} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

import {createLanguageField} from '../../i18n/config'

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: ControlsIcon,
  groups: [
    {name: 'columns', title: 'Footer columns', default: true},
    {name: 'bottom', title: 'Bottom row'},
    {name: 'legacy', title: 'Legacy content'},
  ],
  fields: [
    createLanguageField(),
    defineField({
      name: 'blocks',
      title: 'Footer columns',
      description: 'Ordered columns. The website displays up to four columns on desktop.',
      type: 'array',
      group: 'columns',
      of: [
        defineArrayMember({type: 'footerBrand'}),
        defineArrayMember({type: 'footerContact'}),
        defineArrayMember({type: 'footerWorkingHours'}),
        defineArrayMember({type: 'footerSocial'}),
        defineArrayMember({type: 'footerLinkGroup'}),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'heading',
      title: 'Legacy heading',
      description: 'Retained for existing documents and used only when Footer columns are empty.',
      type: 'string',
      group: 'legacy',
    }),
    defineField({
      name: 'description',
      title: 'Legacy description',
      description: 'Retained for existing documents and used only when Footer columns are empty.',
      type: 'text',
      rows: 3,
      group: 'legacy',
    }),
    defineField({
      name: 'links',
      title: 'Legacy links',
      description: 'Retained for existing documents. New bottom-row links can reuse these as a fallback.',
      type: 'array',
      group: 'legacy',
      of: [defineArrayMember({type: 'footerLink'})],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright text',
      description: 'When dynamic year is enabled, enter only the localized owner or rights text.',
      type: 'string',
      group: 'bottom',
    }),
    defineField({
      name: 'includeCurrentYear',
      title: 'Add © and the current year',
      type: 'boolean',
      initialValue: false,
      group: 'bottom',
    }),
    defineField({
      name: 'bottomLinksLabel',
      title: 'Bottom links accessibility label',
      description: 'Localized label for the bottom-row navigation landmark.',
      type: 'string',
      group: 'bottom',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {bottomLinks?: unknown[]}
          return !parent.bottomLinks?.length || value
            ? true
            : 'Add a localized accessibility label for the bottom links'
        }),
    }),
    defineField({
      name: 'bottomLinks',
      title: 'Bottom links',
      description: 'Optional links such as Privacy Policy and Terms.',
      type: 'array',
      group: 'bottom',
      of: [defineArrayMember({type: 'footerLink'})],
    }),
  ],
  preview: {
    select: {
      language: 'language',
      blocks: 'blocks',
    },
    prepare({language, blocks}) {
      return {
        title: 'Footer',
        subtitle: [
          language ? String(language).toUpperCase() : 'Language not assigned',
          `${blocks?.length || 0} column${blocks?.length === 1 ? '' : 's'}`,
        ].join(' · '),
      }
    },
  },
})
