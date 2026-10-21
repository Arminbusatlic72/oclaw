import {EnvelopeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const footerEmail = defineField({
  name: 'email',
  title: 'Email',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({
      name: 'address',
      title: 'Email address',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
  ],
})

const footerPhone = defineArrayMember({
  name: 'footerPhone',
  title: 'Phone number',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({
      name: 'number',
      title: 'Phone number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'number'},
    prepare({title, subtitle}) {
      return {title: title || subtitle || 'Phone number', subtitle: title ? subtitle : undefined}
    },
  },
})

const footerAddress = defineArrayMember({
  name: 'footerAddress',
  title: 'Physical address',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({
      name: 'address',
      title: 'Address',
      description: 'Line breaks are preserved on the website.',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'address'},
    prepare({title, subtitle}) {
      return {title: title || 'Address', subtitle}
    },
  },
})

export const footerContact = defineType({
  name: 'footerContact',
  title: 'Contact information',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    footerEmail,
    defineField({name: 'phones', title: 'Phone numbers', type: 'array', of: [footerPhone]}),
    defineField({name: 'addresses', title: 'Addresses', type: 'array', of: [footerAddress]}),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const contact = value as
        | {email?: {address?: string}; phones?: unknown[]; addresses?: unknown[]}
        | undefined
      if (contact?.email?.address || contact?.phones?.length || contact?.addresses?.length) return true
      return 'Add an email, phone number, or address'
    }),
  preview: {
    select: {title: 'heading', email: 'email.address', phones: 'phones', addresses: 'addresses'},
    prepare({title, email, phones, addresses}) {
      const count = (phones?.length || 0) + (addresses?.length || 0) + (email ? 1 : 0)
      return {title: title || 'Contact information', subtitle: `${count} contact item${count === 1 ? '' : 's'}`}
    },
  },
})
