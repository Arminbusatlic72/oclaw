import {BlockElementIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Page hero',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showBreadcrumb',
      title: 'Show breadcrumb',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'eyebrow'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Untitled page hero',
      subtitle: subtitle || 'Page hero',
      media: BlockElementIcon,
    }),
  },
})
