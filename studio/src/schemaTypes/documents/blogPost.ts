import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {createLanguageField} from '../../i18n/config'
import {isUniquePageSlug, validatePageSlug} from '../../lib/isUniquePageSlug'

export const blogPost = defineType({
  name: 'blogPost', title: 'Blog post', type: 'document', icon: DocumentIcon,
  fields: [
    createLanguageField(),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 160, isUnique: isUniquePageSlug}, validation: (Rule) => Rule.required().custom(validatePageSlug)}),
    defineField({name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3}),
    defineField({name: 'featuredImage', title: 'Featured image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'author', title: 'Author', type: 'string'}),
    defineField({name: 'publishedAt', title: 'Published date', type: 'datetime', validation: (Rule) => Rule.required()}),
    defineField({name: 'updatedAt', title: 'Updated date', type: 'datetime'}),
    defineField({name: 'body', title: 'Article body', type: 'blogBody', validation: (Rule) => Rule.required().min(1)}),
    defineField({name: 'categories', title: 'Categories', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'tags', title: 'Tags', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'relatedPosts', title: 'Related posts', type: 'array', of: [{type: 'reference', to: [{type: 'blogPost'}]}], validation: (Rule) => Rule.unique()}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'title', media: 'featuredImage', language: 'language', date: 'publishedAt'}, prepare: ({title, media, language, date}) => ({title, media, subtitle: `${String(language || 'en').toUpperCase()} · ${date ? new Date(date).toLocaleDateString() : 'Unpublished'}`})},
})
