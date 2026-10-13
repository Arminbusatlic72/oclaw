import {defineArrayMember, defineField, defineType} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

import {createLanguageField} from '../../i18n/config'

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    createLanguageField(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'footerLink',
          title: 'Footer link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'link',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'link.href',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright text',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({language}) {
      return {
        title: 'Footer',
        subtitle: language ? String(language).toUpperCase() : 'Language not assigned',
      }
    },
  },
})
