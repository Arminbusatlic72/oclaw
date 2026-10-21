import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const footerBrand = defineType({
  name: 'footerBrand',
  title: 'Brand',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo or brand image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          description: 'Leave empty only when the image is decorative.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'linkToHomepage',
      title: 'Link image to this language homepage',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'supportingText',
      title: 'Supporting text',
      type: 'text',
      rows: 4,
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const brand = value as
        | {logo?: {asset?: unknown; alt?: string}; linkToHomepage?: boolean; supportingText?: string}
        | undefined
      if (brand?.logo?.asset && brand.linkToHomepage && !brand.logo.alt) {
        return 'Add alternative text when the image links to the homepage'
      }
      if (brand?.logo?.asset || brand?.supportingText) return true
      return 'Add a logo or supporting text'
    }),
  preview: {
    select: {
      media: 'logo',
      subtitle: 'supportingText',
    },
    prepare({media, subtitle}) {
      return {title: 'Brand', subtitle, media}
    },
  },
})
