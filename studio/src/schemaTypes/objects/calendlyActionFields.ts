import {defineArrayMember, defineField} from 'sanity'

import {calendlyUrlValidationMessage, isApprovedCalendlyUrl} from '../../lib/calendlyUrl'

export const calendlyUrlField = (name: string, title: string, hidden?: (context: {parent?: Record<string, unknown>}) => boolean) =>
  defineField({
    name,
    title,
    type: 'url',
    description: 'The client-approved Calendly event URL. Leave empty until it is provided.',
    hidden,
    validation: (Rule) =>
      Rule.custom((value) =>
        value === undefined || value === null || value === '' || isApprovedCalendlyUrl(value)
          ? true
          : calendlyUrlValidationMessage,
      ),
  })

export const calendlyOfficeOptionsField = (
  name: string,
  hidden?: (context: {parent?: Record<string, unknown>}) => boolean,
) =>
  defineField({
    name,
    title: 'Office-specific booking options',
    type: 'array',
    description: 'Optional. Reuses existing Office documents and overrides the global calendar for that office.',
    hidden,
    of: [
      defineArrayMember({
        name: 'officeBookingOption',
        title: 'Office booking option',
        type: 'object',
        fields: [
          defineField({
            name: 'office',
            type: 'reference',
            to: [{type: 'office'}],
            validation: (Rule) => Rule.required(),
          }),
          calendlyUrlField('eventUrl', 'Calendly event URL'),
        ],
        preview: {
          select: {title: 'office.name', subtitle: 'eventUrl'},
          prepare: ({title, subtitle}) => ({
            title: title || 'Office booking option',
            subtitle: subtitle || 'Calendly URL required before activation',
          }),
        },
      }),
    ],
    validation: (Rule) => Rule.unique(),
  })
