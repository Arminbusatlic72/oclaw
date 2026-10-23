import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'

export const practiceAreaArchive = defineType({
  name: 'practiceAreaArchive', title: 'Practice areas archive', type: 'document',
  fields: [createLanguageField(), defineField({name: 'heading', type: 'string'}), defineField({name: 'description', type: 'text'}), defineField({name: 'introduction', type: 'blockContentTextOnly'}), defineField({name: 'emptyMessage', type: 'string'}), defineField({name: 'seo', type: 'seo'})],
  preview: {select: {title: 'heading', subtitle: 'language'}},
})
