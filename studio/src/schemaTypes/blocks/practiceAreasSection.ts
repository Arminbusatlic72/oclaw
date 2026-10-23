import {defineField, defineType} from 'sanity'

export const practiceAreasSection = defineType({
  name: 'practiceAreasSection', title: 'Practice areas section', type: 'object',
  fields: [
    defineField({name: 'subtitle', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', type: 'text'}),
    defineField({name: 'theme', type: 'string', options: {list: ['dark', 'light']}, initialValue: 'dark'}),
    defineField({name: 'selectionMode', type: 'string', options: {list: ['automatic', 'manual']}, initialValue: 'automatic'}),
    defineField({name: 'practiceAreas', title: 'Manual practice areas', type: 'array', of: [{type: 'reference', to: [{type: 'practiceArea'}]}], hidden: ({parent}) => parent?.selectionMode !== 'manual', validation: (Rule) => Rule.unique()}),
    defineField({name: 'maximumItems', type: 'number', initialValue: 6, validation: (Rule) => Rule.integer().min(1).max(24)}),
    defineField({name: 'viewAllLabel', type: 'string'}),
    defineField({name: 'anchor', type: 'slug'}),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || 'Practice areas', subtitle: 'Practice areas section'})},
})
