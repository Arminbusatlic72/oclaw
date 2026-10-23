import {defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'
import {isUniqueContentSlug, validateContentSlug} from '../../lib/isUniqueContentSlug'

export const office = defineType({
  name: 'office', title: 'Office', type: 'document',
  fields: [
    createLanguageField(),
    defineField({name: 'name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name', maxLength: 96, isUnique: isUniqueContentSlug}, validation: (Rule) => Rule.required().custom(validateContentSlug)}),
    defineField({name: 'streetAddress', type: 'string'}),
    defineField({name: 'addressLine2', type: 'string'}),
    defineField({name: 'city', type: 'string'}),
    defineField({name: 'state', type: 'string'}),
    defineField({name: 'postalCode', type: 'string'}),
    defineField({name: 'country', type: 'string'}),
    defineField({name: 'phone', type: 'string'}),
    defineField({name: 'email', type: 'email'}),
    defineField({name: 'mapUrl', type: 'url'}),
    defineField({name: 'coordinates', type: 'geopoint'}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'openingHours', type: 'array', of: [{type: 'object', name: 'officeHours', fields: [defineField({name: 'days', type: 'string'}), defineField({name: 'hours', type: 'string'})]}]}),
    defineField({name: 'displayOrder', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer()}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {select: {title: 'name', subtitle: 'city', media: 'image'}},
})
