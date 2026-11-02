import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'

export const practiceAreaArchive = defineType({
  name: 'practiceAreaArchive', title: 'Practice areas archive', type: 'document',
  fields: [createLanguageField(), defineField({name: 'heading', type: 'string'}), defineField({name: 'description', type: 'text'}), defineField({name: 'cardsHeading', title: 'Cards section title', type: 'string'}), defineField({name: 'theme', title: 'Archive theme', type: 'string', options: {layout: 'radio', list: [{title: 'Light', value: 'light'}, {title: 'Dark', value: 'dark'}]}, initialValue: 'light'}), defineField({name: 'introduction', type: 'blockContentTextOnly'}), defineField({name: 'emptyMessage', type: 'string'}), defineField({name: 'seo', type: 'seo'})],
  preview: {select: {title: 'heading', subtitle: 'language'}},
})
