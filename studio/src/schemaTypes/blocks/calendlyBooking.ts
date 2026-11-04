import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {calendlyOfficeOptionsField, calendlyUrlField} from '../objects/calendlyActionFields'

export const calendlyBooking = defineType({
  name: 'calendlyBooking',
  title: 'Calendly booking',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    defineField({name: 'heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({
      name: 'displayMode',
      title: 'Display mode',
      type: 'string',
      initialValue: 'inline',
      options: {
        layout: 'radio',
        list: [
          {title: 'Inline', value: 'inline'},
          {title: 'Popup', value: 'popup'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    calendlyUrlField('eventUrl', 'Global Calendly event URL'),
    defineField({
      name: 'buttonLabel',
      title: 'Booking button label',
      type: 'string',
      description: 'Optional. Add localized copy on each translated page.',
    }),
    calendlyOfficeOptionsField('officeBookingOptions'),
    defineField({
      name: 'embedHeight',
      title: 'Embed height (pixels)',
      type: 'number',
      initialValue: 760,
      validation: (Rule) => Rule.integer().min(600).max(1200),
    }),
    defineField({
      name: 'privacyNotice',
      title: 'Privacy notice',
      type: 'text',
      rows: 3,
      description: 'Optional localized notice shown before Calendly loads. Do not request case details here.',
    }),
    defineField({
      name: 'fallbackLinkLabel',
      title: 'Fallback link label',
      type: 'string',
      description: 'Optional localized label for the external Calendly link.',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const block = value as
        | {eventUrl?: string; officeBookingOptions?: Array<{eventUrl?: string}>}
        | undefined
      return block?.eventUrl || block?.officeBookingOptions?.some((option) => option.eventUrl)
        ? true
        : 'This block is hidden on the public site until a client-approved Calendly URL is added.'
    }).warning(),
  preview: {
    select: {title: 'heading', eventUrl: 'eventUrl', officeOptions: 'officeBookingOptions'},
    prepare: ({title, eventUrl, officeOptions}) => ({
      title: title || 'Calendly booking',
      subtitle:
        eventUrl || officeOptions?.some((option: {eventUrl?: string}) => option.eventUrl)
          ? 'Ready to display'
          : 'Configuration needed: add an approved Calendly URL',
      media: CalendarIcon,
    }),
  },
})
