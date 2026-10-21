import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'

export const blogArchive = defineType({
  name: 'blogArchive', title: 'Blog archive', type: 'document',
  fields: [
    createLanguageField(),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'introduction', title: 'Introduction', type: 'blockContentTextOnly'}),
    defineField({name: 'ctaLabel', title: 'Call to action label', type: 'string'}),
    defineField({name: 'ctaHref', title: 'Call to action URL', type: 'url'}),
    defineField({name: 'postsPerPage', title: 'Posts per page', type: 'number', initialValue: 10, validation: (Rule) => Rule.integer().min(1).max(50)}),
    defineField({name: 'emptyMessage', title: 'Empty state message', type: 'string'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {language: 'language', heading: 'heading'}, prepare: ({language, heading}) => ({title: `Blog archive (${String(language || 'en').toUpperCase()})`, subtitle: heading})},
})
