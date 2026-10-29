import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const contactForm = defineType({
  name: 'contactForm',
  title: 'Contact form',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({
      name: 'formMode',
      type: 'string',
      initialValue: 'generalInquiry',
      options: {layout: 'radio', list: [{title: 'General inquiry', value: 'generalInquiry'}, {title: 'Appointment request', value: 'appointmentRequest'}]},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'submitButtonLabel', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'successMessage', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'errorMessage', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'privacyPolicyLink', type: 'link', validation: (Rule) => Rule.required()}),
  ],
  preview: {select: {title: 'heading', mode: 'formMode'}, prepare: ({title, mode}) => ({title: title || 'Contact form', subtitle: mode === 'appointmentRequest' ? 'Appointment request' : 'General inquiry', media: EnvelopeIcon})},
})
