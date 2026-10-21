import {LinkIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const footerLink = defineType({
  name: 'footerLink',
  title: 'Footer link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Destination',
      type: 'link',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      linkType: 'link.linkType',
      href: 'link.href',
      pageTitle: 'link.page.name',
    },
    prepare({title, linkType, href, pageTitle}) {
      return {
        title: title || 'Untitled link',
        subtitle: linkType === 'page' ? pageTitle || 'Page reference' : href,
      }
    },
  },
})
