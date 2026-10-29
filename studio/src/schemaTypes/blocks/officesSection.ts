import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const officesSection = defineType({
  name: 'officesSection',
  title: 'Offices section',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({name: 'subtitle', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'theme', type: 'string', options: {layout: 'radio', list: [{title: 'Dark', value: 'dark'}, {title: 'Light', value: 'light'}]}, initialValue: 'dark'}),
    defineField({name: 'selectionMode', type: 'string', options: {layout: 'radio', list: [{title: 'Automatic', value: 'automatic'}, {title: 'Manual', value: 'manual'}]}, initialValue: 'automatic'}),
    defineField({
      name: 'offices',
      title: 'Manual offices',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'office'}], options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language || 'en'}})}}],
      hidden: ({parent}) => parent?.selectionMode !== 'manual',
      validation: (Rule) => Rule.unique(),
    }),
    defineField({name: 'maximumItems', type: 'number', initialValue: 3, validation: (Rule) => Rule.integer().min(1).max(12)}),
    defineField({name: 'showAttorneys', title: 'Show assigned attorneys', type: 'boolean', initialValue: true}),
    defineField({name: 'viewAllLabel', title: 'View all button label', type: 'string'}),
    defineField({name: 'anchor', type: 'slug'}),
  ],
  preview: {select: {title: 'heading', theme: 'theme'}, prepare: ({title, theme}) => ({title: title || 'Offices', subtitle: `${theme === 'light' ? 'Light' : 'Dark'} offices section`, media: PinIcon})},
})
