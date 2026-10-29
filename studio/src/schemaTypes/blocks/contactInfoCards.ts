import {EnvelopeIcon, PinIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const contactInfoCards = defineType({
  name: 'contactInfoCards',
  title: 'Contact information cards',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Section heading', type: 'string'}),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'contactInfoCard',
          title: 'Contact card',
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              type: 'string',
              initialValue: 'address',
              options: {list: [{title: 'Address', value: 'address'}, {title: 'Email', value: 'email'}, {title: 'Phone', value: 'phone'}]},
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'office',
              title: 'Office record (preferred)',
              description: 'When selected, address, phone, or email is read from this Office record according to the icon.',
              type: 'reference',
              to: [{type: 'office'}],
              options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language || 'en'}})},
            }),
            defineField({
              name: 'content',
              title: 'Manual content',
              description: 'Fallback for information that does not belong to an Office record. Use one display line per item.',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule) => Rule.unique(),
            }),
            defineField({name: 'linkLabel', title: 'Optional link label', type: 'string'}),
            defineField({name: 'link', title: 'Optional link', type: 'link'}),
          ],
          preview: {
            select: {title: 'title', subtitle: 'office.name', icon: 'icon'},
            prepare: ({title, subtitle, icon}) => ({title, subtitle: subtitle || 'Manual contact information', media: icon === 'address' ? PinIcon : EnvelopeIcon}),
          },
        }),
      ],
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || 'Contact information cards', subtitle: 'Contact information cards', media: EnvelopeIcon})},
})
