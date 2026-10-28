import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'
import {isUniqueContentSlug, validateContentSlug} from '../../lib/isUniqueContentSlug'

export const attorney = defineType({
  name: 'attorney', title: 'Attorney', type: 'document',
  fields: [
    createLanguageField(),
    defineField({name: 'fullName', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'fullName', maxLength: 96, isUnique: isUniqueContentSlug}, validation: (Rule) => Rule.required().custom(validateContentSlug)}),
    defineField({name: 'professionalTitle', type: 'string'}),
    defineField({name: 'yearsOfExperience', title: 'Years of experience', type: 'string', description: 'Shown on the profile card, e.g. "12 Years".'}),
    defineField({name: 'practiceAddress', title: 'Practice address', type: 'string'}),
    defineField({name: 'profileImage', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'shortBiography', type: 'text', rows: 3}),
    defineField({name: 'biography', type: 'blockContent'}),
    defineField({name: 'experience', title: 'Personal experience', type: 'blockContent'}),
    defineField({name: 'education', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'skills', type: 'array', of: [defineField({name: 'skill', type: 'object', fields: [defineField({name: 'label', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'level', title: 'Proficiency (%)', type: 'number', validation: (Rule) => Rule.min(0).max(100).required()})]})]}),
    defineField({name: 'achievements', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'certificates', type: 'array', of: [{type: 'image', fields: [defineField({name: 'alt', type: 'string', validation: (Rule) => Rule.required()})]}]}),
    defineField({name: 'barAdmissions', title: 'Bar admissions', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'professionalMemberships', title: 'Professional memberships', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'languagesSpoken', title: 'Languages spoken', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'email', type: 'email'}),
    defineField({name: 'phone', type: 'string'}),
    defineField({name: 'socialLinks', title: 'Public social links', type: 'array', of: [{type: 'object', fields: [defineField({name: 'label', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'url', type: 'url', validation: (Rule) => Rule.required().uri({scheme: ['https']})})]}]}),
    defineField({name: 'practiceAreas', type: 'array', of: [{type: 'reference', to: [{type: 'practiceArea'}], options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language || 'en'}})}}], validation: (Rule) => Rule.unique()}),
    defineField({name: 'offices', type: 'array', of: [{type: 'reference', to: [{type: 'office'}], options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language || 'en'}})}}], validation: (Rule) => Rule.unique()}),
    defineField({name: 'displayOrder', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer()}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {select: {title: 'fullName', subtitle: 'professionalTitle', media: 'profileImage'}},
})
