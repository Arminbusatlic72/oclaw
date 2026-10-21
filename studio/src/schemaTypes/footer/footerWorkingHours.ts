import {ClockIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const footerHoursEntry = defineArrayMember({
  name: 'footerHoursEntry',
  title: 'Hours entry',
  type: 'object',
  fields: [
    defineField({
      name: 'days',
      title: 'Day or day range',
      description: 'Examples: Monday, Monday–Friday, Lunes–Viernes',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'isClosed', title: 'Closed', type: 'boolean', initialValue: false}),
    defineField({
      name: 'hours',
      title: 'Hours',
      type: 'string',
      hidden: ({parent}) => Boolean(parent?.isClosed),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {isClosed?: boolean}
          return parent?.isClosed || value ? true : 'Hours are required when this entry is open'
        }),
    }),
    defineField({
      name: 'closedLabel',
      title: 'Closed label',
      description: 'Enter the localized text shown to visitors, such as Closed or Cerrado.',
      type: 'string',
      hidden: ({parent}) => !parent?.isClosed,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {isClosed?: boolean}
          return !parent?.isClosed || value ? true : 'Enter the localized closed label'
        }),
    }),
    defineField({
      name: 'note',
      title: 'Optional note',
      description: 'Examples: Emergency calls only, Solo llamadas de emergencia',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'days', hours: 'hours', closedLabel: 'closedLabel', note: 'note'},
    prepare({title, hours, closedLabel, note}) {
      return {title: title || 'Hours entry', subtitle: [closedLabel || hours, note].filter(Boolean).join(' — ')}
    },
  },
})

export const footerWorkingHours = defineType({
  name: 'footerWorkingHours',
  title: 'Working hours',
  type: 'object',
  icon: ClockIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'entries',
      title: 'Hours',
      type: 'array',
      of: [footerHoursEntry],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', entries: 'entries'},
    prepare({title, entries}) {
      const count = entries?.length || 0
      return {title: title || 'Working hours', subtitle: `${count} entr${count === 1 ? 'y' : 'ies'}`}
    },
  },
})
