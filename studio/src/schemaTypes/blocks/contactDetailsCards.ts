import {ClockIcon, EnvelopeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const contactDetailsCards = defineType({
  name: 'contactDetailsCards',
  title: 'Contact details cards',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Section heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'emailTitle', title: 'Email card title', type: 'string', initialValue: 'Email', validation: (Rule) => Rule.required()}),
    defineField({name: 'emailAddress', title: 'Email address', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'phoneTitle', title: 'Phone card title', type: 'string', initialValue: 'Phone', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'phoneNumbers',
      title: 'Phone numbers',
      type: 'array',
      of: [defineArrayMember({type: 'object', fields: [
        defineField({name: 'label', title: 'Location label', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'number', title: 'Phone number', type: 'string', validation: (Rule) => Rule.required()}),
      ]})],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({name: 'hoursTitle', title: 'Hours card title', type: 'string', initialValue: 'Working hours', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'hours',
      title: 'Hours lines',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || 'Contact details cards', subtitle: 'Email, phone, and working hours', media: ClockIcon})},
})
