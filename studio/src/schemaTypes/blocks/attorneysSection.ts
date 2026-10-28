import {UsersIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const attorneysSection = defineType({
  name: 'attorneysSection',
  title: 'Attorneys section',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'subtitle',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Qualified Attorneys',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Meet Our Experts',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'selectionMode',
      title: 'Attorney selection',
      type: 'string',
      options: {
        list: [
          {title: 'Automatic — use display order', value: 'automatic'},
          {title: 'Manual — choose and order attorneys', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'automatic',
    }),
    defineField({
      name: 'attorneys',
      title: 'Attorneys',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'attorney'}],
          options: {
            filter: ({document}) => ({
              filter: 'language == $language',
              params: {language: document?.language || 'en'},
            }),
          },
        },
      ],
      hidden: ({parent}) => parent?.selectionMode !== 'manual',
      validation: (Rule) => Rule.unique().max(8),
    }),
    defineField({
      name: 'maximumItems',
      title: 'Maximum attorneys',
      type: 'number',
      initialValue: 4,
      validation: (Rule) => Rule.integer().min(1).max(8),
    }),
    defineField({
      name: 'showSocialLinks',
      title: 'Show social links',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'viewAllLabel',
      title: 'View all button label',
      type: 'string',
      description: 'Leave empty to hide the button.',
    }),
    defineField({
      name: 'theme',
      title: 'Background',
      type: 'string',
      initialValue: 'dark',
      options: {
        list: [
          {title: 'Dark', value: 'dark'},
          {title: 'Light', value: 'light'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Section anchor',
      type: 'slug',
      options: {source: 'heading'},
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'subtitle'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Meet Our Experts',
      subtitle: subtitle || 'Attorneys section',
      media: UsersIcon,
    }),
  },
})
