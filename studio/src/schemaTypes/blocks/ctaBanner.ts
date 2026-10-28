import {BulbOutlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const ctaBanner = defineType({
  name: 'ctaBanner',
  title: 'CTA banner',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'button', title: 'Button', type: 'button'}),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'eyebrow'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Untitled CTA banner',
      subtitle: subtitle || 'CTA banner',
      media: BulbOutlineIcon,
    }),
  },
})
