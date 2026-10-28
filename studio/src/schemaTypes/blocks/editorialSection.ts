import {TextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const editorialSection = defineType({
  name: 'editorialSection',
  title: 'Editorial section',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const image = context.parent as {asset?: {_ref?: string}} | undefined
              return image?.asset?._ref && !value
                ? 'Alt text is required when an image is selected.'
                : true
            }),
        }),
      ],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'contained',
      options: {
        list: [
          {title: 'Contained text', value: 'contained'},
          {title: 'Split with image', value: 'split'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      initialValue: 'right',
      options: {
        list: [
          {title: 'Right', value: 'right'},
          {title: 'Left', value: 'left'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => parent?.layout !== 'split',
    }),
    defineField({
      name: 'theme',
      title: 'Background',
      type: 'string',
      initialValue: 'white',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Soft', value: 'soft'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Section anchor',
      type: 'slug',
      options: {source: 'heading'},
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'eyebrow', media: 'image.asset'},
    prepare: ({title, subtitle, media}) => ({
      title: title || 'Untitled editorial section',
      subtitle: subtitle || 'Editorial section',
      media: media || TextIcon,
    }),
  },
})
