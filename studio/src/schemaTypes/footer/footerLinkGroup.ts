import {LinkIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const footerLinkGroup = defineType({
  name: 'footerLinkGroup',
  title: 'Link group',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'footerLink'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', links: 'links'},
    prepare({title, links}) {
      const count = links?.length || 0
      return {title: title || 'Link group', subtitle: `${count} link${count === 1 ? '' : 's'}`}
    },
  },
})
