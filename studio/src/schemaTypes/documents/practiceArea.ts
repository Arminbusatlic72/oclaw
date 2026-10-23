import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'
import {isUniqueContentSlug, validateContentSlug} from '../../lib/isUniqueContentSlug'

export const practiceArea = defineType({
  name: 'practiceArea', title: 'Practice area', type: 'document',
  fields: [
    createLanguageField(),
    defineField({name: 'title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title', maxLength: 96, isUnique: isUniqueContentSlug}, validation: (Rule) => Rule.required().custom(validateContentSlug)}),
    defineField({name: 'shortDescription', title: 'Short description', type: 'text', rows: 3}),
    defineField({name: 'mainImage', title: 'Main image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'icon', title: 'Line icon', description: 'Optional licensed icon image for cards', type: 'image', fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({name: 'body', title: 'Main content', type: 'blockContent'}),
    defineField({name: 'sourcePublishedAt', title: 'Original WordPress publication date', type: 'datetime', readOnly: true}),
    defineField({name: 'sections', title: 'Additional sections', type: 'array', of: [{type: 'object', name: 'practiceAreaContentSection', fields: [defineField({name: 'heading', type: 'string'}), defineField({name: 'body', type: 'blockContent'})]}]}),
    defineField({name: 'displayOrder', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer()}),
    defineField({name: 'featuredOnHomepage', type: 'boolean', initialValue: false}),
    defineField({name: 'consultationLabel', type: 'string'}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {select: {title: 'title', media: 'mainImage', language: 'language'}, prepare: ({title, media, language}) => ({title, media, subtitle: String(language || 'en').toUpperCase()})},
})
